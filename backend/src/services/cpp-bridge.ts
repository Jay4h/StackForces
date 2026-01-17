/**
 * C++ Bridge Service
 * Interface to Herin's C++ cryptographic engine
 */

interface CPPModule {
    generateDID: (publicKey: string, hardwareId: string) => string;
}

let cppModule: CPPModule | null = null;

/**
 * Initialize the C++ module
 * This will be called after the C++ addon is built
 */
export const initCPPModule = (): void => {
    try {
        // This will fail until C++ module is compiled
        // That's expected - we'll handle it gracefully
        cppModule = require('../../cpp-engine/build/Release/bharat_crypto');
        console.log('✅ C++ cryptographic engine loaded');
    } catch (error) {
        console.warn('⚠️  C++ module not available, using JavaScript fallback');
        cppModule = null;
    }
};

/**
 * Generate a DID using C++ engine (or JavaScript fallback)
 */
export const generateDID = (publicKey: string, hardwareId: string): string => {
    if (cppModule) {
        // Use high-performance C++ engine
        return cppModule.generateDID(publicKey, hardwareId);
    } else {
        // Fallback to JavaScript implementation
        return generateDIDFallback(publicKey, hardwareId);
    }
};

/**
 * JavaScript fallback for DID generation
 * Uses Node.js crypto module (slower than C++ but functional)
 */
function generateDIDFallback(publicKey: string, hardwareId: string): string {
    const crypto = require('crypto');
    const salt = 'BHARAT_SOVEREIGN_2026';
    const rawInput = publicKey + hardwareId + salt;

    const hash = crypto
        .createHash('sha256')
        .update(rawInput)
        .digest('hex');

    return `did:bharat:${hash}`;
}
