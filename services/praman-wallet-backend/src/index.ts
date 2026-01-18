/**
 * ========================================
 * PRAMAN WALLET BACKEND
 * ========================================
 * Citizen's interface to manage DIDs and credentials
 * User-controlled, encrypted storage
 * Selective disclosure support
 * ========================================
 */

import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import crypto from 'crypto';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3004;

const DID_REGISTRY_URL = process.env.DID_REGISTRY_URL || 'http://localhost:3001';

app.use(helmet());
app.use(cors());
app.use(express.json());

// ========================================
// MODELS
// ========================================

// Encrypted credential storage (user-specific)
const WalletSchema = new mongoose.Schema({
    userDID: { type: String, required: true, unique: true, index: true },
    credentials: [{
        id: String,
        type: String[],
        issuer: String,
        issuanceDate: Date,
        encryptedData: String, // Credential stored encrypted
        createdAt: { type: Date, default: Date.now },
    }],
    pairwiseDIDs: [{
        service: String,
        pairwiseDID: String,
        createdAt: { type: Date, default: Date.now },
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const WalletModel = mongoose.model('Wallet', WalletSchema);

// ========================================
// DID GENERATION HELPERS
// ========================================

function generateMasterDID(): string {
    const randomId = crypto.randomBytes(16).toString('hex');
    return `did:praman:${randomId}`;
}

function generatePairwiseDID(masterDID: string, service: string): string {
    const hash = crypto
        .createHash('sha256')
        .update(`${masterDID}:${service}`)
        .digest('hex');
    return `did:praman:pairwise:${hash}`;
}

function encryptCredential(credential: any, encryptionKey: string): string {
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'hex').slice(0, 32), Buffer.alloc(16, 0));
    let encrypted = cipher.update(JSON.stringify(credential), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${encrypted}:${authTag.toString('hex')}`;
}

function decryptCredential(encryptedData: string, encryptionKey: string): any {
    const [encrypted, authTag] = encryptedData.split(':');
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(encryptionKey, 'hex').slice(0, 32), Buffer.alloc(16, 0));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
}

// ========================================
// ROUTES
// ========================================

/**
 * POST /wallet/did/create
 * Generate new master DID for citizen
 */
app.post('/wallet/did/create', async (req: Request, res: Response) => {
    try {
        const { publicKey } = req.body;

        if (!publicKey) {
            return res.status(400).json({ error: 'publicKey is required' });
        }

        // Generate master DID
        const masterDID = generateMasterDID();

        // Create DID Document
        const didDocument = {
            '@context': ['https://www.w3.org/ns/did/v1'],
            id: masterDID,
            verificationMethod: [{
                id: `${masterDID}#key-1`,
                type: 'EcdsaSecp256k1VerificationKey2019',
                controller: masterDID,
                publicKeyHex: publicKey,
            }],
            authentication: [`${masterDID}#key-1`],
        };

        // Register DID in registry
        await axios.post(`${DID_REGISTRY_URL}/dids`, didDocument);

        // Create wallet for user
        await WalletModel.create({ userDID: masterDID });

        res.status(201).json({
            success: true,
            masterDID,
            didDocument,
            message: 'DID created successfully',
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create DID' });
    }
});

/**
 * POST /wallet/did/pairwise
 * Generate pairwise DID for specific service
 */
app.post('/wallet/did/pairwise', async (req: Request, res: Response) => {
    try {
        const { masterDID, service } = req.body;

        if (!masterDID || !service) {
            return res.status(400).json({ error: 'masterDID and service are required' });
        }

        // Find wallet
        const wallet = await WalletModel.findOne({ userDID: masterDID });
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        // Check if pairwise DID already exists for this service
        const existing = wallet.pairwiseDIDs.find((p: any) => p.service === service);
        if (existing) {
            return res.status(200).json({
                success: true,
                pairwiseDID: existing.pairwiseDID,
                message: 'Pairwise DID already exists',
            });
        }

        // Generate new pairwise DID
        const pairwiseDID = generatePairwiseDID(masterDID, service);

        // Store in wallet
        wallet.pairwiseDIDs.push({ service, pairwiseDID });
        await wallet.save();

        res.status(201).json({
            success: true,
            pairwiseDID,
            service,
            message: 'Pairwise DID created',
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create pairwise DID' });
    }
});

/**
 * POST /wallet/credentials/store
 * Store received credential (encrypted)
 */
app.post('/wallet/credentials/store', async (req: Request, res: Response) => {
    try {
        const { masterDID, credential, encryptionKey } = req.body;

        if (!masterDID || !credential || !encryptionKey) {
            return res.status(400).json({ error: 'masterDID, credential, and encryptionKey are required' });
        }

        // Find wallet
        const wallet = await WalletModel.findOne({ userDID: masterDID });
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        // Encrypt credential
        const encryptedData = encryptCredential(credential, encryptionKey);

        // Store credential
        wallet.credentials.push({
            id: credential.id || crypto.randomUUID(),
            type: credential.type,
            issuer: credential.issuer,
            issuanceDate: new Date(credential.issuanceDate),
            encryptedData,
        });

        wallet.updatedAt = new Date();
        await wallet.save();

        res.status(201).json({
            success: true,
            message: 'Credential stored successfully',
            credentialCount: wallet.credentials.length,
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to store credential' });
    }
});

/**
 * GET /wallet/credentials/:did
 * List user's credentials (decrypted)
 */
app.get('/wallet/credentials/:did', async (req: Request, res: Response) => {
    try {
        const { did } = req.params;
        const { encryptionKey } = req.query;

        if (!encryptionKey) {
            return res.status(400).json({ error: 'encryptionKey is required' });
        }

        const wallet = await WalletModel.findOne({ userDID: did });
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        // Decrypt credentials
        const credentials = wallet.credentials.map((cred: any) => {
            try {
                const decrypted = decryptCredential(cred.encryptedData, encryptionKey as string);
                return {
                    id: cred.id,
                    type: cred.type,
                    issuer: cred.issuer,
                    issuanceDate: cred.issuanceDate,
                    credential: decrypted,
                };
            } catch (error) {
                return {
                    id: cred.id,
                    error: 'Failed to decrypt',
                };
            }
        });

        res.status(200).json({
            success: true,
            masterDID: did,
            credentialCount: credentials.length,
            credentials,
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to retrieve credentials' });
    }
});

/**
 * POST /wallet/present
 * Create Verifiable Presentation (selective disclosure)
 */
app.post('/wallet/present', async (req: Request, res: Response) => {
    try {
        const { masterDID, credentialIds, encryptionKey, disclosedFields } = req.body;

        if (!masterDID || !credentialIds || !encryptionKey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const wallet = await WalletModel.findOne({ userDID: masterDID });
        if (!wallet) {
            return res.status(404).json({ error: 'Wallet not found' });
        }

        // Get requested credentials
        const selectedCredentials = wallet.credentials
            .filter((cred: any) => credentialIds.includes(cred.id))
            .map((cred: any) => decryptCredential(cred.encryptedData, encryptionKey));

        // Create Verifiable Presentation
        const presentation = {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: 'VerifiablePresentation',
            holder: masterDID,
            verifiableCredential: selectedCredentials,
            proof: {
                type: 'EcdsaSecp256k1Signature2019',
                created: new Date().toISOString(),
                proofPurpose: 'authentication',
                verificationMethod: `${masterDID}#key-1`,
                challenge: crypto.randomBytes(16).toString('hex'),
            },
        };

        res.status(200).json({
            success: true,
            presentation,
            message: 'Presentation created successfully',
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create presentation' });
    }
});

/**
 * GET /health
 */
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        service: 'praman-wallet-backend',
        status: 'healthy',
        timestamp: new Date().toISOString(),
    });
});

// ========================================
// START SERVER
// ========================================

const startServer = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/praman-wallet';
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected');

        app.listen(PORT, () => {
            console.log(`🚀 Wallet Backend running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
