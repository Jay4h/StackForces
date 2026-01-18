/**
 * ========================================
 * PRODUCTION USER MODEL
 * ========================================
 * User model with:
 * - PII encryption at rest
 * - Proper indexing (compound indices for DIDs)
 * - TTL index for session tokens
 * - Mongoose middleware for encryption
 * ========================================
 */

import mongoose, { Schema, Document } from 'mongoose';
import { encryptPII, decryptPII } from '../services/cpp-bridge';
import { logger } from '../utils/logger';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const PII_ENCRYPTION_ENABLED = process.env.PII_ENCRYPTION_ENABLED === 'true';

export interface IUser extends Document {
    // Master DID (Global Identity)
    masterDID: string;

    // Personal Information (PII - Encrypted at rest)
    personalInfo: {
        name: string;
        email: string;
        phone?: string;
        address?: string;
        dateOfBirth?: string;
    };

    // WebAuthn Credentials
    webAuthnCredentials: {
        credentialID: string;
        credentialPublicKey: string;
        counter: number;
        transports?: string[];
        aaguid?: string; // Authenticator AAGUID for attestation
        attestationType?: 'none' | 'basic' | 'self' | 'attca' | 'ecdaa'; // Attestation type
    }[];

    // Device Information
    deviceInfo: {
        hardwareId: string;
        userAgent: string;
        platform: string;
        deviceType?: 'Mobile' | 'PC' | 'Unknown';
        deviceName?: string;
        authenticatorType?: 'platform' | 'cross-platform';
        lastUsed?: Date;
    };

    // Pairwise DIDs (Service-specific identities)
    pairwiseDIDs: {
        serviceName: string; // e.g., 'healthcare', 'agriculture'
        pairwiseDID: string;
        createdAt: Date;
        lastAccessed?: Date;
    }[];

    // Session Management
    sessions: {
        token: string;
        createdAt: Date;
        expiresAt: Date;
        deviceInfo?: string;
        ipAddress?: string;
    }[];

    // Security & Audit
    security: {
        killSwitchActive: boolean;
        lastLogin?: Date;
        failedLoginAttempts: number;
        accountLocked: boolean;
        lockReason?: string;
    };

    // Metadata
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        masterDID: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        personalInfo: {
            name: { type: String, required: true }, // Will be encrypted
            email: { type: String, required: true }, // Will be encrypted
            phone: { type: String }, // Will be encrypted
            address: { type: String }, // Will be encrypted
            dateOfBirth: { type: String }, // Will be encrypted
        },

        webAuthnCredentials: [{
            credentialID: { type: String, required: true, unique: true },
            credentialPublicKey: { type: String, required: true },
            counter: { type: Number, required: true, default: 0 },
            transports: [{ type: String }],
            aaguid: { type: String },
            attestationType: {
                type: String,
                enum: ['none', 'basic', 'self', 'attca', 'ecdaa'],
            },
        }],

        deviceInfo: {
            hardwareId: { type: String, required: true },
            userAgent: { type: String, required: true },
            platform: { type: String, required: true },
            deviceType: {
                type: String,
                enum: ['Mobile', 'PC', 'Unknown'],
            },
            deviceName: { type: String },
            authenticatorType: {
                type: String,
                enum: ['platform', 'cross-platform'],
            },
            lastUsed: { type: Date },
        },

        pairwiseDIDs: [{
            serviceName: { type: String, required: true },
            pairwiseDID: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
            lastAccessed: { type: Date },
        }],

        sessions: [{
            token: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
            expiresAt: { type: Date, required: true },
            deviceInfo: { type: String },
            ipAddress: { type: String },
        }],

        security: {
            killSwitchActive: { type: Boolean, default: false },
            lastLogin: { type: Date },
            failedLoginAttempts: { type: Number, default: 0 },
            accountLocked: { type: Boolean, default: false },
            lockReason: { type: String },
        },
    },
    {
        timestamps: true,
    }
);

// ========================================
// INDEXES FOR PERFORMANCE
// ========================================

// Compound index for pairwise DID lookups
UserSchema.index({ 'pairwiseDIDs.pairwiseDID': 1 });

// Index for credential lookups
UserSchema.index({ 'webAuthnCredentials.credentialID': 1 });

// TTL index for automatic session cleanup
UserSchema.index({ 'sessions.expiresAt': 1 }, { expireAfterSeconds: 0 });

// Index for security lookups
UserSchema.index({ 'security.killSwitchActive': 1 });

// ========================================
// MIDDLEWARE - PII ENCRYPTION
// ========================================

/**
 * Pre-save middleware: Encrypt PII before saving
 */
UserSchema.pre('save', async function (next) {
    if (!PII_ENCRYPTION_ENABLED) {
        return next();
    }

    try {
        // Only encrypt if modified
        if (this.isModified('personalInfo')) {
            const pii = this.personalInfo;

            // Encrypt each PII field
            if (pii.name && !pii.name.startsWith('ENCRYPTED:')) {
                pii.name = `ENCRYPTED:${encryptPII(pii.name)}`;
            }
            if (pii.email && !pii.email.startsWith('ENCRYPTED:')) {
                pii.email = `ENCRYPTED:${encryptPII(pii.email)}`;
            }
            if (pii.phone && !pii.phone.startsWith('ENCRYPTED:')) {
                pii.phone = `ENCRYPTED:${encryptPII(pii.phone)}`;
            }
            if (pii.address && !pii.address.startsWith('ENCRYPTED:')) {
                pii.address = `ENCRYPTED:${encryptPII(pii.address)}`;
            }
            if (pii.dateOfBirth && !pii.dateOfBirth.startsWith('ENCRYPTED:')) {
                pii.dateOfBirth = `ENCRYPTED:${encryptPII(pii.dateOfBirth)}`;
            }
        }

        next();
    } catch (error: any) {
        logger.error('❌ PII encryption failed', {
            error: error.message,
            masterDID: this.masterDID?.substring(0, 20) + '...',
        });
        next(error);
    }
});

/**
 * Post-find middleware: Decrypt PII after retrieval
 */
UserSchema.post(['find', 'findOne'], function (docs: any) {
    if (!PII_ENCRYPTION_ENABLED) return;

    const decryptDoc = (doc: any) => {
        if (!doc || !doc.personalInfo) return;

        try {
            const pii = doc.personalInfo;

            if (pii.name?.startsWith('ENCRYPTED:')) {
                pii.name = decryptPII(pii.name.replace('ENCRYPTED:', ''));
            }
            if (pii.email?.startsWith('ENCRYPTED:')) {
                pii.email = decryptPII(pii.email.replace('ENCRYPTED:', ''));
            }
            if (pii.phone?.startsWith('ENCRYPTED:')) {
                pii.phone = decryptPII(pii.phone.replace('ENCRYPTED:', ''));
            }
            if (pii.address?.startsWith('ENCRYPTED:')) {
                pii.address = decryptPII(pii.address.replace('ENCRYPTED:', ''));
            }
            if (pii.dateOfBirth?.startsWith('ENCRYPTED:')) {
                pii.dateOfBirth = decryptPII(pii.dateOfBirth.replace('ENCRYPTED:', ''));
            }
        } catch (error: any) {
            logger.error('❌ PII decryption failed', {
                error: error.message,
            });
        }
    };

    if (Array.isArray(docs)) {
        docs.forEach(decryptDoc);
    } else {
        decryptDoc(docs);
    }
});

// ========================================
// INSTANCE METHODS
// ========================================

/**
 * Get or create pairwise DID for a service
 */
UserSchema.methods.getPairwiseDID = function (serviceName: string): string {
    const existing = this.pairwiseDIDs.find((p: any) => p.serviceName === serviceName);

    if (existing) {
        // Update last accessed
        existing.lastAccessed = new Date();
        return existing.pairwiseDID;
    }

    // Generate new pairwise DID
    const { generatePairwiseDID } = require('../services/cpp-bridge');
    const pairwiseDID = generatePairwiseDID(this.masterDID, serviceName);

    this.pairwiseDIDs.push({
        serviceName,
        pairwiseDID,
        createdAt: new Date(),
    });

    return pairwiseDID;
};

/**
 * Clean up expired sessions
 */
UserSchema.methods.cleanupSessions = function (): void {
    const now = new Date();
    this.sessions = this.sessions.filter((s: any) => s.expiresAt > now);
};

export const UserModel = mongoose.model<IUser>('User', UserSchema);
