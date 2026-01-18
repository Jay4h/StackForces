/**
 * ========================================
 * C++ CRYPTOGRAPHIC BRIDGE - PRODUCTION
 * ========================================
 * Hardware-bound security with C++ native addon
 * - Master DID generation
 * - Pairwise DID blinding
 * - Signature verification
 * - NO JavaScript crypto for DIDs in production
 * ========================================
 */

import { logger } from '../utils/logger';
import crypto from 'crypto';

interface CPPModule {
    generateMasterDID: (publicKey: string, hardwareId: string, salt: string) => string;
    generatePairwiseDID: (masterDID: string, serviceDomain: string) => string;
    generateShadowDID: (masterDID: string, serviceID: string) => string;
    verifySignature: (publicKey: string, data: string, signature: string) => boolean;
    encryptPII: (data: string, key: string) => string;
    decryptPII: (encrypted: string, key: string) => string;
}

let cppModule: CPPModule | null = null;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const CPP_FALLBACK_ENABLED = process.env.CPP_FALLBACK_ENABLED === 'true';
const DID_SALT = process.env.DID_SALT || 'PRAMAN_SOVEREIGN_INDIA_2026_PRODUCTION';

/**
 * Initialize C++ cryptographic module
 * CRITICAL: Must be compiled for target environment (Linux/Alpine)
 */
export const initCPPModule = (): void => {
    try {
        const modulePath = process.env.CPP_MODULE_PATH || '../../native_modules/ecosystem_core.node';
        cppModule = require(modulePath);

        logger.info('✅ C++ cryptographic engine loaded', {
            path: modulePath,
            functions: Object.keys(cppModule || {}),
        });
    } catch (error: any) {
        logger.error('❌ Failed to load C++ module', {
            error: error.message,
            path: process.env.CPP_MODULE_PATH,
        });

        if (IS_PRODUCTION && !CPP_FALLBACK_ENABLED) {
            logger.error('💀 C++ module required in production. Exiting...');
            throw new Error('C++ cryptographic module not available in production');
        } else {
            logger.warn('⚠️  Using JavaScript fallback (NOT recommended for production)');
            cppModule = null;
        }
    }
};

/**
 * Generate Master DID (Global Identity)
 * Uses C++ native addon for performance and security
 */
export const generateMasterDID = (publicKey: string, hardwareId: string): string => {
    if (cppModule) {
        // Production path: Use C++ engine
        return cppModule.generateMasterDID(publicKey, hardwareId, DID_SALT);
    } else {
        // Fallback path: JavaScript implementation
        if (IS_PRODUCTION) {
            logger.error('❌ SECURITY VIOLATION: Using JS crypto in production');
        }
        return generateMasterDIDFallback(publicKey, hardwareId);
    }
};

/**
 * Generate Pairwise DID (Service-specific identity)
 * Derived from master DID using domain binding
 */
export const generatePairwiseDID = (masterDID: string, serviceDomain: string): string => {
    if (cppModule) {
        // Production path: Use C++ engine
        return cppModule.generatePairwiseDID(masterDID, serviceDomain);
    } else {
        // Fallback path: JavaScript implementation
        return generatePairwiseDIDFallback(masterDID, serviceDomain);
    }
};

/**
 * Generate Shadow DID (OAUTH Service-Specific ID)
 * This is used for third-party OAuth flows (e.g. Health Portal, Farm Portal)
 * Formula: SHA256(MasterDID + KeepSecret(ClientID))
 */
export const generateShadowDID = (masterDID: string, serviceID: string): string => {
    if (cppModule && cppModule.generateShadowDID) {
        return cppModule.generateShadowDID(masterDID, serviceID);
    } else {
        return generateShadowDIDFallback(masterDID, serviceID);
    }
};

/**
 * Verify cryptographic signature
 */
export const verifySignature = (
    publicKey: string,
    data: string,
    signature: string
): boolean => {
    if (cppModule) {
        return cppModule.verifySignature(publicKey, data, signature);
    } else {
        return verifySignatureFallback(publicKey, data, signature);
    }
};

/**
 * Encrypt PII data at rest (AES-256-GCM)
 */
export const encryptPII = (data: string): string => {
    const encryptionKey = process.env.ENCRYPTION_MASTER_KEY;

    if (!encryptionKey) {
        throw new Error('ENCRYPTION_MASTER_KEY not configured');
    }

    if (cppModule) {
        return cppModule.encryptPII(data, encryptionKey);
    } else {
        return encryptPIIFallback(data, encryptionKey);
    }
};

/**
 * Decrypt PII data
 */
export const decryptPII = (encrypted: string): string => {
    const encryptionKey = process.env.ENCRYPTION_MASTER_KEY;

    if (!encryptionKey) {
        throw new Error('ENCRYPTION_MASTER_KEY not configured');
    }

    if (cppModule) {
        return cppModule.decryptPII(encrypted, encryptionKey);
    } else {
        return decryptPIIFallback(encrypted, encryptionKey);
    }
};

// ========================================
// JAVASCRIPT FALLBACK IMPLEMENTATIONS
// (NOT recommended for production)
// ========================================

/**
 * JavaScript fallback for Master DID generation
 */
function generateMasterDIDFallback(publicKey: string, hardwareId: string): string {
    const rawInput = `${publicKey}:${hardwareId}:${DID_SALT}`;
    const hash = crypto.createHash('sha256').update(rawInput).digest('hex');
    return `did:praman:${hash}`;
}

/**
 * JavaScript fallback for Pairwise DID generation
 */
function generatePairwiseDIDFallback(masterDID: string, serviceDomain: string): string {
    const rawInput = `${masterDID}:${serviceDomain}:${DID_SALT}`;
    const hash = crypto.createHash('sha256').update(rawInput).digest('hex');
    return `did:praman:pairwise:${hash}`;
}

/**
 * JavaScript fallback for Shadow DID generation
 */
function generateShadowDIDFallback(masterDID: string, serviceID: string): string {
    const rawInput = masterDID + serviceID; // Formula as specified in C++
    const hash = crypto.createHash('sha256').update(rawInput).digest('hex');
    return `did:bharat:shadow:${hash}`;
}

/**
 * JavaScript fallback for signature verification
 */
function verifySignatureFallback(
    publicKey: string,
    data: string,
    signature: string
): boolean {
    try {
        const verifier = crypto.createVerify('SHA256');
        verifier.update(data);
        return verifier.verify(publicKey, signature, 'hex');
    } catch (error) {
        logger.error('❌ Signature verification failed', { error });
        return false;
    }
}

/**
 * JavaScript fallback for PII encryption (AES-256-GCM)
 */
function encryptPIIFallback(data: string, key: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        'aes-256-gcm',
        Buffer.from(key, 'hex').slice(0, 32),
        iv
    );

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * JavaScript fallback for PII decryption
 */
function decryptPIIFallback(encrypted: string, key: string): string {
    const parts = encrypted.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
    }

    const [ivHex, authTagHex, encryptedData] = parts;

    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        Buffer.from(key, 'hex').slice(0, 32),
        Buffer.from(ivHex, 'hex')
    );

    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

/**
 * Check if C++ module is available
 */
export const isCPPModuleAvailable = (): boolean => {
    return cppModule !== null;
};

/**
 * Get crypto engine status
 */
export const getCryptoEngineStatus = (): {
    engine: 'cpp' | 'javascript';
    available: boolean;
    production: boolean;
} => {
    return {
        engine: cppModule ? 'cpp' : 'javascript',
        available: cppModule !== null,
        production: IS_PRODUCTION,
    };
};

/**
 * Alias for generateMasterDID for backward compatibility
 */
export const generateDID = generateMasterDID;

export default {
    initCPPModule,
    generateMasterDID,
    generateDID,
    generatePairwiseDID,
    generateShadowDID,
    verifySignature,
    encryptPII,
    decryptPII,
    isCPPModuleAvailable,
    getCryptoEngineStatus,
};
