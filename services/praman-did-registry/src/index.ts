/**
 * ========================================
 * PRAMAN DID REGISTRY SERVICE
 * ========================================
 * Public, read-only DID resolver
 * Follows W3C DID specification
 * Stateless, JSON-only, No PII
 * ========================================
 */

import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// ========================================
// DID DOCUMENT MODEL
// ========================================

interface DIDDocument {
    '@context': string | string[];
    id: string;
    controller?: string;
    verificationMethod: VerificationMethod[];
    authentication?: string[];
    assertionMethod?: string[];
    service?: ServiceEndpoint[];
    created: Date;
    updated: Date;
    deactivated?: boolean;
}

interface VerificationMethod {
    id: string;
    type: string;
    controller: string;
    publicKeyHex?: string;
    publicKeyBase58?: string;
}

interface ServiceEndpoint {
    id: string;
    type: string;
    serviceEndpoint: string;
}

const DIDDocumentSchema = new mongoose.Schema({
    '@context': { type: [String], default: ['https://www.w3.org/ns/did/v1'] },
    id: { type: String, required: true, unique: true, index: true },
    controller: { type: String },
    verificationMethod: [{
        id: String,
        type: String,
        controller: String,
        publicKeyHex: String,
        publicKeyBase58: String,
    }],
    authentication: [String],
    assertionMethod: [String],
    service: [{
        id: String,
        type: String,
        serviceEndpoint: String,
    }],
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    deactivated: { type: Boolean, default: false },
});

const DIDDocumentModel = mongoose.model('DIDDocument', DIDDocumentSchema);

// ========================================
// ROUTES
// ========================================

/**
 * GET /dids/:did
 * Resolve DID to DID Document (W3C standard)
 */
app.get('/dids/:did', async (req: Request, res: Response) => {
    try {
        const { did } = req.params;

        //Validate DID format
        if (!did.startsWith('did:praman:')) {
            return res.status(400).json({
                error: 'Invalid DID format',
                message: 'DID must start with did:praman:',
            });
        }

        // Resolve from database
        const didDocument = await DIDDocumentModel.findOne({ id: did });

        if (!didDocument) {
            return res.status(404).json({
                error: 'DID not found',
                message: `DID ${did} does not exist in registry`,
            });
        }

        if (didDocument.deactivated) {
            return res.status(410).json({
                error: 'DID deactivated',
                message: `DID ${did} has been deactivated`,
            });
        }

        res.status(200).json(didDocument);
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /dids/:did/keys
 * Get public keys for verification (fast lookup)
 */
app.get('/dids/:did/keys', async (req: Request, res: Response) => {
    try {
        const { did } = req.params;

        const didDocument = await DIDDocumentModel.findOne({ id: did });

        if (!didDocument || didDocument.deactivated) {
            return res.status(404).json({ error: 'DID not found or deactivated' });
        }

        res.status(200).json({
            did: didDocument.id,
            verificationMethod: didDocument.verificationMethod,
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /dids
 * Register new DID (admin only - requires auth in production)
 */
app.post('/dids', async (req: Request, res: Response) => {
    try {
        const didDocument = req.body;

        // Validate required fields
        if (!didDocument.id || !didDocument.verificationMethod) {
            return res.status(400).json({
                error: 'Invalid DID Document',
                message: 'id and verificationMethod are required',
            });
        }

        // Check if DID already exists
        const existing = await DIDDocumentModel.findOne({ id: didDocument.id });
        if (existing) {
            return res.status(409).json({
                error: 'DID already exists',
                message: `DID ${didDocument.id} is already registered`,
            });
        }

        // Create DID Document
        const newDID = await DIDDocumentModel.create(didDocument);

        res.status(201).json({
            message: 'DID registered successfully',
            did: newDID.id,
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * PUT /dids/:did/deactivate
 * Deactivate a DID (soft delete)
 */
app.put('/dids/:did/deactivate', async (req: Request, res: Response) => {
    try {
        const { did } = req.params;

        const result = await DIDDocumentModel.findOneAndUpdate(
            { id: did },
            { deactivated: true, updated: new Date() },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ error: 'DID not found' });
        }

        res.status(200).json({
            message: 'DID deactivated successfully',
            did: result.id,
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        service: 'praman-did-registry',
        status: 'healthy',
        timestamp: new Date().toISOString(),
    });
});

// ========================================
// START SERVER
// ========================================

const startServer = async () => {
    try {
        // Connect to MongoDB
        const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/praman-did-registry';
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected');

        app.listen(PORT, () => {
            console.log(`🚀 DID Registry running on port ${PORT}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
