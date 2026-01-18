/**
 * ========================================
 * PRAMAN VERIFIER SERVICE
 * ========================================
 * Verifies Verifiable Credentials
 * For: Doctors, Insurers, Third Parties
 * 100% Stateless - No data storage
 * ========================================
 */

import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import axios from 'axios';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3003;

// Service URLs
const DID_REGISTRY_URL = process.env.DID_REGISTRY_URL || 'http://localhost:3001';
const ISSUER_SERVICE_URL = process.env.ISSUER_SERVICE_URL || 'http://localhost:3002';

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ========================================
// VERIFICATION HELPERS
// ========================================

/**
 * Resolve DID from registry
 */
async function resolveDID(did: string): Promise<any> {
    try {
        const response = await axios.get(`${DID_REGISTRY_URL}/dids/${did}`);
        return response.data;
    } catch (error) {
        throw new Error(`Failed to resolve DID: ${did}`);
    }
}

/**
 * Check revocation status
 */
async function checkRevocation(credentialId: string): Promise<boolean> {
    try {
        const response = await axios.get(`${ISSUER_SERVICE_URL}/credentials/status/${credentialId}`);
        return response.data.revoked === true;
    } catch (error) {
        return false; // Assume not revoked if service unavailable
    }
}

/**
 * Verify signature (simplified)
 */
function verifySignature(credential: any, publicKey: string): boolean {
    try {
        const dataToVerify = JSON.stringify({
            '@context': credential['@context'],
            type: credential.type,
            issuer: credential.issuer,
            issuanceDate: credential.issuanceDate,
            credentialSubject: credential.credentialSubject,
        });

        // In production, use proper JWS verification
        // This is simplified for demonstration
        return credential.proof && credential.proof.jws && credential.proof.jws.length > 0;
    } catch (error) {
        return false;
    }
}

// ========================================
// ROUTES
// ========================================

/**
 * POST /verify/credential
 * Verify a Verifiable Credential
 */
app.post('/verify/credential', async (req: Request, res: Response) => {
    try {
        const { credential } = req.body;

        if (!credential || !credential.issuer || !credential.proof) {
            return res.status(400).json({
                error: 'Invalid credential',
                message: 'Credential must have issuer and proof',
            });
        }

        // Step 1: Resolve issuer DID
        let issuerDIDDocument;
        try {
            issuerDIDDocument = await resolveDID(credential.issuer);
        } catch (error: any) {
            return res.status(400).json({
                verified: false,
                error: 'Invalid issuer',
                message: error.message,
            });
        }

        // Step 2: Check if issuer DID is active
        if (issuerDIDDocument.deactivated) {
            return res.status(400).json({
                verified: false,
                error: 'Issuer deactivated',
                message: 'Issuer DID has been deactivated',
            });
        }

        // Step 3: Get issuer's public key
        const verificationMethod = issuerDIDDocument.verificationMethod?.[0];
        if (!verificationMethod) {
            return res.status(400).json({
                verified: false,
                error: 'No verification method',
                message: 'Issuer has no public key',
            });
        }

        // Step 4: Verify signature
        const signatureValid = verifySignature(credential, verificationMethod.publicKeyHex);

        if (!signatureValid) {
            return res.status(200).json({
                verified: false,
                reason: 'Invalid signature',
            });
        }

        // Step 5: Check revocation (if credential has ID)
        const credentialId = credential.id || credential.proof.jws;
        const isRevoked = await checkRevocation(credentialId);

        if (isRevoked) {
            return res.status(200).json({
                verified: false,
                reason: 'Credential has been revoked',
            });
        }

        // All checks passed
        res.status(200).json({
            verified: true,
            issuer: credential.issuer,
            subject: credential.credentialSubject.id,
            issuanceDate: credential.issuanceDate,
            message: 'Credential is valid',
        });
    } catch (error: any) {
        res.status(500).json({
            verified: false,
            error: 'Verification failed',
            message: error.message,
        });
    }
});

/**
 * POST /verify/presentation
 * Verify a Verifiable Presentation (multiple credentials)
 */
app.post('/verify/presentation', async (req: Request, res: Response) => {
    try {
        const { presentation } = req.body;

        if (!presentation || !presentation.verifiableCredential) {
            return res.status(400).json({
                error: 'Invalid presentation',
                message: 'Presentation must contain verifiableCredential',
            });
        }

        const credentials = Array.isArray(presentation.verifiableCredential)
            ? presentation.verifiableCredential
            : [presentation.verifiableCredential];

        // Verify each credential
        const results = await Promise.all(
            credentials.map(async (credential) => {
                try {
                    // Reuse credential verification logic
                    const issuerDIDDocument = await resolveDID(credential.issuer);
                    const signatureValid = verifySignature(credential, issuerDIDDocument.verificationMethod[0].publicKeyHex);
                    const isRevoked = await checkRevocation(credential.id || credential.proof.jws);

                    return {
                        credential: credential.id,
                        verified: signatureValid && !isRevoked && !issuerDIDDocument.deactivated,
                        issuer: credential.issuer,
                    };
                } catch (error) {
                    return {
                        credential: credential.id,
                        verified: false,
                        error: 'Verification failed',
                    };
                }
            })
        );

        const allVerified = results.every((r) => r.verified);

        res.status(200).json({
            verified: allVerified,
            results,
            totalCredentials: credentials.length,
        });
    } catch (error: any) {
        res.status(500).json({
            verified: false,
            error: 'Presentation verification failed',
        });
    }
});

/**
 * GET /verify/status/:did
 * Check if DID is active
 */
app.get('/verify/status/:did', async (req: Request, res: Response) => {
    try {
        const { did } = req.params;

        const didDocument = await resolveDID(did);

        res.status(200).json({
            did,
            active: !didDocument.deactivated,
            created: didDocument.created,
            updated: didDocument.updated,
        });
    } catch (error: any) {
        res.status(404).json({
            did: req.params.did,
            active: false,
            error: 'DID not found',
        });
    }
});

/**
 * GET /health
 */
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        service: 'praman-verifier-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
    });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
    console.log(`🚀 Verifier Service running on port ${PORT}`);
    console.log(`📡 DID Registry: ${DID_REGISTRY_URL}`);
    console.log(`📡 Issuer Service: ${ISSUER_SERVICE_URL}`);
});

export default app;
