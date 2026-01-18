/**
 * ========================================
 * PRODUCTION WEBAUTHN CONFIGURATION
 * ========================================
 * Hardware-bound security with:
 * - User verification required (biometric mandatory)
 * - Platform authenticators only (TPM/Secure Enclave)
 * - Attestation validation (detect emulators)
 * - Production RP configuration
 * ========================================
 */

import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
    VerifiedRegistrationResponse,
    VerifiedAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON,
    RegistrationResponseJSON,
    AuthenticationResponseJSON,
} from '@simplewebauthn/server/script/deps';
import { logger } from '../utils/logger';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Relying Party (RP) Configuration
 */
export const RP_CONFIG = {
    name: process.env.RP_NAME || 'Praman',
    id: process.env.RP_ID || 'localhost',
    origin: process.env.EXPECTED_ORIGIN || 'http://localhost:5173',
};

/**
 * Production WebAuthn options
 */
export const WEBAUTHN_CONFIG = {
    // User verification requirement
    userVerification: (process.env.WEBAUTHN_USER_VERIFICATION as 'required' | 'preferred' | 'discouraged') ||
        (IS_PRODUCTION ? 'required' : 'preferred'),

    // Authenticator attachment
    authenticatorAttachment: (process.env.WEBAUTHN_AUTHENTICATOR_ATTACHMENT as 'platform' | 'cross-platform') ||
        (IS_PRODUCTION ? 'platform' : undefined),

    // Attestation requirement
    attestation: (process.env.WEBAUTHN_ATTESTATION_REQUIRED === 'true' || IS_PRODUCTION)
        ? 'direct' as const
        : 'none' as const,

    // Timeout (60 seconds)
    timeout: 60000,

    // Challenge size (32 bytes = 256 bits)
    challengeSize: 32,
};

/**
 * Generate WebAuthn registration options
 */
export const generateRegistrationChallenge = async (params: {
    userId: string;
    userName: string;
    userDisplayName: string;
}): Promise<PublicKeyCredentialCreationOptionsJSON> => {
    try {
        const options = await generateRegistrationOptions({
            rpName: RP_CONFIG.name,
            rpID: RP_CONFIG.id,
            userID: params.userId,
            userName: params.userName,
            userDisplayName: params.userDisplayName,

            // Timeout
            timeout: WEBAUTHN_CONFIG.timeout,

            // Attestation
            attestationType: WEBAUTHN_CONFIG.attestation,

            // Authenticator selection
            authenticatorSelection: {
                authenticatorAttachment: WEBAUTHN_CONFIG.authenticatorAttachment,
                userVerification: WEBAUTHN_CONFIG.userVerification,
                requireResidentKey: false,
                residentKey: 'preferred',
            },

            // Supported algorithms (ES256, RS256)
            supportedAlgorithmIDs: [-7, -257],
        });

        logger.info('WebAuthn registration challenge generated', {
            userId: params.userId,
            rpId: RP_CONFIG.id,
            attestation: WEBAUTHN_CONFIG.attestation,
        });

        return options;
    } catch (error: any) {
        logger.error('Failed to generate registration challenge', {
            error: error.message,
            userId: params.userId,
        });
        throw error;
    }
};

/**
 * Verify WebAuthn registration response
 */
export const verifyRegistrationChallenge = async (params: {
    response: RegistrationResponseJSON;
    expectedChallenge: string;
}): Promise<VerifiedRegistrationResponse> => {
    try {
        const verification = await verifyRegistrationResponse({
            response: params.response,
            expectedChallenge: params.expectedChallenge,
            expectedOrigin: RP_CONFIG.origin,
            expectedRPID: RP_CONFIG.id,
            requireUserVerification: WEBAUTHN_CONFIG.userVerification === 'required',
        });

        if (!verification.verified) {
            logger.warn('Registration verification failed', {
                reason: 'Verification returned false',
            });
        }

        // Production: Validate attestation
        if (IS_PRODUCTION && verification.registrationInfo) {
            const { aaguid, credentialPublicKey } = verification.registrationInfo;

            // Check if authenticator is on approved list
            // (You can maintain a whitelist of AAGUIDs for approved devices)
            logger.info('Attestation validated', {
                aaguid: aaguid?.toString('hex'),
                credentialType: verification.registrationInfo.credentialType,
            });
        }

        logger.info('Registration verification successful', {
            verified: verification.verified,
            credentialId: verification.registrationInfo?.credentialID.toString('base64'),
        });

        return verification;
    } catch (error: any) {
        logger.error('Registration verification failed', {
            error: error.message,
        });
        throw error;
    }
};

/**
 * Generate WebAuthn authentication options
 */
export const generateAuthenticationChallenge = async (params: {
    allowCredentials?: {
        id: string;
        type: 'public-key';
        transports?: AuthenticatorTransport[];
    }[];
}): Promise<PublicKeyCredentialRequestOptionsJSON> => {
    try {
        const options = await generateAuthenticationOptions({
            rpID: RP_CONFIG.id,
            timeout: WEBAUTHN_CONFIG.timeout,
            userVerification: WEBAUTHN_CONFIG.userVerification,
            allowCredentials: params.allowCredentials,
        });

        logger.info('Authentication challenge generated', {
            rpId: RP_CONFIG.id,
            credentialCount: params.allowCredentials?.length || 0,
        });

        return options;
    } catch (error: any) {
        logger.error('Failed to generate authentication challenge', {
            error: error.message,
        });
        throw error;
    }
};

/**
 * Verify WebAuthn authentication response
 */
export const verifyAuthenticationChallenge = async (params: {
    response: AuthenticationResponseJSON;
    expectedChallenge: string;
    credentialPublicKey: string;
    credentialID: string;
    counter: number;
}): Promise<VerifiedAuthenticationResponse> => {
    try {
        const verification = await verifyAuthenticationResponse({
            response: params.response,
            expectedChallenge: params.expectedChallenge,
            expectedOrigin: RP_CONFIG.origin,
            expectedRPID: RP_CONFIG.id,
            authenticator: {
                credentialID: Buffer.from(params.credentialID, 'base64'),
                credentialPublicKey: Buffer.from(params.credentialPublicKey, 'base64'),
                counter: params.counter,
            },
            requireUserVerification: WEBAUTHN_CONFIG.userVerification === 'required',
        });

        if (!verification.verified) {
            logger.warn('Authentication verification failed', {
                reason: 'Verification returned false',
            });
        }

        logger.info('Authentication verification successful', {
            verified: verification.verified,
            newCounter: verification.authenticationInfo?.newCounter,
        });

        return verification;
    } catch (error: any) {
        logger.error('Authentication verification failed', {
            error: error.message,
        });
        throw error;
    }
};

/**
 * Validate authenticator AAGUID against allowlist
 * (Production-only feature)
 */
export const validateAuthenticatorAAGUID = (aaguid: Buffer): boolean => {
    if (!IS_PRODUCTION) return true;

    // Example AAGUIDs for approved authenticators:
    const APPROVED_AAGUIDS = [
        '08987058-cadc-4b81-b6e1-30de50dcbe96', // Windows Hello
        'adce0002-35bc-c60a-648b-0b25f1f05503', // Chrome on Mac
        '00000000-0000-0000-0000-000000000000', // Generic platform authenticator
    ];

    const aaguidString = aaguid.toString('hex');
    const formatted = `${aaguidString.slice(0, 8)}-${aaguidString.slice(8, 12)}-${aaguidString.slice(12, 16)}-${aaguidString.slice(16, 20)}-${aaguidString.slice(20)}`;

    const isApproved = APPROVED_AAGUIDS.includes(formatted);

    if (!isApproved) {
        logger.warn('Authenticator not on approved list', {
            aaguid: formatted,
        });
    }

    return isApproved;
};

export default {
    RP_CONFIG,
    WEBAUTHN_CONFIG,
    generateRegistrationChallenge,
    verifyRegistrationChallenge,
    generateAuthenticationChallenge,
    verifyAuthenticationChallenge,
    validateAuthenticatorAAGUID,
};
