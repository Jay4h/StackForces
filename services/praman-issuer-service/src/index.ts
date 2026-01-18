/**
 * ========================================
 * PRAMAN ISSUER SERVICE
 * ========================================
 * Issues Verifiable Credentials
 * For: Hospitals, Labs, Government
 * Stateless, JSON-only, No PII storage
 * ========================================
 */

import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());

// ========================================
// MODELS
// ========================================

interface VerifiableCredential {
    '@context': string[];
    type: string[];
    issuer: string; // DID of issuer (hospital/lab)
    issuanceDate: string;
    credentialSubject: any; // Data being attested (NO PII stored here)
    proof: CredentialProof;
}

interface CredentialProof {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    jws: string; // JSON Web Signature
}

// Revocation list (simple implementation)
const RevocationSchema = new mongoose.Schema({
    credentialId: { type: String, required: true, unique: true, index: true },
    issuer: { type: String, required: true },
    revokedAt: { type: Date, default: Date.now },
    reason: { type: String },
});

const RevocationModel = mongoose.model('Revocation', RevocationSchema);

// ========================================
// CRYPTO HELPERS
// ========================================

/**
 * Sign credential (simplified - in production use proper JWS)
 */
function signCredential(credential: any, issuerPrivateKey: string): string {
    const dataToSign = JSON.stringify({
        '@context': credential['@context'],
        type: credential.type,
        issuer: credential.issuer,
        issuanceDate: credential.issuanceDate,
        credentialSubject: credential.credentialSubject,
    });

    const signature = crypto
        .createHmac('sha256', issuerPrivateKey)
        .update(dataToSign)
        .digest('hex');

    return signature;
}

/**
 * Generate credential ID
 */
function generateCredentialId(): string {
    return `urn:uuid:${crypto.randomUUID()}`;
}

// ========================================
// ROUTES
// ========================================

/**
 * POST /credentials/issue
 * Issue a new Verifiable Credential
 */
app.post('/credentials/issue', async (req: Request, res: Response) => {
    try {
        const {
            issuerDID,
            subjectDID,
            credentialType,
            claims,
            issuerPrivateKey, // In production, use secure key management
        } = req.body;

        if (!issuerDID || !subjectDID || !credentialType || !claims) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['issuerDID', 'subjectDID', 'credentialType', 'claims'],
            });
        }

        const credentialId = generateCredentialId();
        const issuanceDate = new Date().toISOString();

        // Build Verifiable Credential
        const credential: VerifiableCredential = {
            '@context': [
                'https://www.w3.org/2018/credentials/v1',
                'https://praman.gov.in/credentials/v1',
            ],
            type: ['VerifiableCredential', credentialType],
            issuer: issuerDID,
            issuanceDate,
            credentialSubject: {
                id: subjectDID,
                ...claims,
            },
            proof: {
                type: 'EcdsaSecp256k1Signature2019',
                created: issuanceDate,
                proofPurpose: 'assertionMethod',
                verificationMethod: `${issuerDID}#key-1`,
                jws: '', // Will be filled below
            },
        };

        // Sign credential
        const signature = signCredential(credential, issuerPrivateKey || 'default-key');
        credential.proof.jws = signature;

        // Return credential (NOT stored - sent to user's wallet)
        res.status(201).json({
            success: true,
            credential,
            credentialId,
            message: 'Credential issued successfully. Store in your wallet.',
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to issue credential' });
    }
});

/**
 * POST /credentials/revoke
 * Revoke a previously issued credential
 */
app.post('/credentials/revoke', async (req: Request, res: Response) => {
    try {
        const { credentialId, issuerDID, reason } = req.body;

        if (!credentialId || !issuerDID) {
            return res.status(400).json({
                error: 'credentialId and issuerDID are required',
            });
        }

        // Add to revocation list
        await RevocationModel.create({
            credentialId,
            issuer: issuerDID,
            reason: reason || 'Revoked by issuer',
        });

        res.status(200).json({
            success: true,
            message: 'Credential revoked successfully',
            credentialId,
        });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Credential already revoked' });
        }
        res.status(500).json({ error: 'Failed to revoke credential' });
    }
});

/**
 * GET /credentials/status/:id
 * Check if credential has been revoked
 */
app.get('/credentials/status/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const revocation = await RevocationModel.findOne({ credentialId: id });

        if (revocation) {
            return res.status(200).json({
                revoked: true,
                revokedAt: revocation.revokedAt,
                reason: revocation.reason,
            });
        }

        res.status(200).json({
            revoked: false,
            message: 'Credential is valid',
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to check status' });
    }
});

/**
 * GET /health
 */
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        service: 'praman-issuer-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
    });
});

// ========================================
// START SERVER
// ========================================

const startServer = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/praman-issuer';
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected');

        app.listen(PORT, () => {
            console.log(`🚀 Issuer Service running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
