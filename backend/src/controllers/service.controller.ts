import { Request, Response } from 'express';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { DIDModel } from '../models/did.model';
import { AuditLog } from '../models/auditLog.model';
import crypto from 'crypto';

// Import C++ module with fallback
let cppModule: any;
try {
    cppModule = require('../../../cpp-engine/build/Release/bharat_crypto.node');
    console.log('✅ C++ cryptographic engine loaded for Phase 2');
} catch (error) {
    console.warn('⚠️  C++ module not available, using JavaScript fallback');
    cppModule = {
        generatePairwiseDID: (globalDID: string, serviceName: string, portalSecret: string) => {
            const hmac = crypto.createHmac('sha256', portalSecret);
            hmac.update(globalDID + '|' + serviceName);
            const hash = hmac.digest('hex');
            return `did:bharat:${serviceName}:${hash}`;
        },
        filterClaims: (profileJSON: string, allowedFields: string[]) => {
            const profile = JSON.parse(profileJSON);
            const filtered: any = {};
            for (const field of allowedFields) {
                if (profile[field] !== undefined) {
                    filtered[field] = profile[field];
                }
            }
            return JSON.stringify(filtered);
        }
    };
}

const PORTAL_SECRET = process.env.PORTAL_SECRET || 'BHARAT_PORTAL_TRUST_2026';
const RP_ID = process.env.RP_ID || 'localhost';
const EXPECTED_ORIGIN = process.env.EXPECTED_ORIGIN || 'http://localhost:5173';

// Service configuration
const SERVICE_CONFIGS = {
    health: {
        name: 'health',
        displayName: 'Health Portal',
        requestedFields: ['bloodGroup', 'fullName', 'dateOfBirth']
    },
    agriculture: {
        name: 'agriculture',
        displayName: 'Agriculture Portal',
        requestedFields: ['farmerStatus', 'fullName', 'address']
    },
    smartcity: {
        name: 'smartcity',
        displayName: 'Smart City Portal',
        requestedFields: ['residencyStatus', 'fullName', 'address']
    }
};

/**
 * Phase 2: Generate WebAuthn Challenge for Service Login
 */
export const generateServiceChallenge = async (req: Request, res: Response) => {
    try {
        const { did, serviceName } = req.body;

        if (!did || !serviceName) {
            return res.status(400).json({
                success: false,
                message: 'DID and service name are required'
            });
        }

        if (!SERVICE_CONFIGS[serviceName as keyof typeof SERVICE_CONFIGS]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service name'
            });
        }

        // Verify DID exists
        const user = await DIDModel.findOne({ did });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'DID not found. Please enroll first.'
            });
        }

        // Generate challenge
        const challenge = crypto.randomBytes(32).toString('base64url');
        const sessionId = crypto.randomUUID();

        // Store challenge in session (In production, use Redis)
        const challengeKey = `challenge:${sessionId}`;
        // For now, we'll send it back and verify in the next step

        // Get service config
        const serviceConfig = SERVICE_CONFIGS[serviceName as keyof typeof SERVICE_CONFIGS];

        res.json({
            success: true,
            challenge,
            sessionId,
            service: serviceConfig,
            allowCredentials: [
                {
                    id: user.credentialId,
                    type: 'public-key',
                    transports: ['internal', 'hybrid']
                }
            ],
            rpId: RP_ID,
            userVerification: 'required'
        });

    } catch (error: any) {
        console.error('Error generating service challenge:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate authentication challenge',
            error: error.message
        });
    }
};

/**
 * Phase 2: Verify Authentication & Generate Pairwise DID
 * Returns service-specific DID and filtered profile data
 */
export const authorizeService = async (req: Request, res: Response) => {
    try {
        const {
            did,
            serviceName,
            authResponse,
            sessionId,
            expectedChallenge,
            consentedFields
        } = req.body;

        // Validate inputs
        if (!did || !serviceName || !authResponse || !expectedChallenge) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        const serviceConfig = SERVICE_CONFIGS[serviceName as keyof typeof SERVICE_CONFIGS];
        if (!serviceConfig) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service name'
            });
        }

        // Fetch user from database
        const user = await DIDModel.findOne({ did });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify WebAuthn authentication
        let verification;
        try {
            verification = await verifyAuthenticationResponse({
                response: authResponse,
                expectedChallenge,
                expectedOrigin: EXPECTED_ORIGIN,
                expectedRPID: RP_ID,
                authenticator: {
                    credentialID: Buffer.from(user.credentialId, 'base64'),
                    credentialPublicKey: Buffer.from(user.publicKey, 'base64'),
                    counter: user.counter
                },
                requireUserVerification: true
            });

        } catch (error: any) {
            console.error('WebAuthn verification failed:', error);
            return res.status(401).json({
                success: false,
                message: 'Biometric verification failed',
                error: error.message
            });
        }

        if (!verification.verified) {
            return res.status(401).json({
                success: false,
                message: 'Authentication failed'
            });
        }

        // Update counter to prevent replay attacks
        user.counter = verification.authenticationInfo.newCounter;
        await user.save();

        // Generate Pairwise DID using C++ engine
        const pairwiseDID = cppModule.generatePairwiseDID(
            did,
            serviceName,
            PORTAL_SECRET
        );

        // Determine which fields to share (user consent + service request intersection)
        const requestedFields = serviceConfig.requestedFields;
        const fieldsToShare = consentedFields?.length
            ? requestedFields.filter((f: string) => consentedFields.includes(f))
            : requestedFields;

        // Filter profile data using C++ engine
        const fullProfile = user.profile || {};
        const filteredProfile = cppModule.filterClaims(
            JSON.stringify(fullProfile),
            fieldsToShare
        );

        // Log to audit trail
        await AuditLog.create({
            globalDID: did,
            serviceName,
            pairwiseDID,
            requestedFields,
            sharedFields: fieldsToShare,
            userConsent: true,
            sessionId,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            timestamp: new Date()
        });

        // Return service-specific identity and data
        res.json({
            success: true,
            message: 'Authorization successful',
            data: {
                pairwiseDID,
                serviceName: serviceConfig.displayName,
                profile: JSON.parse(filteredProfile),
                sharedFields: fieldsToShare,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error('Error in service authorization:', error);
        res.status(500).json({
            success: false,
            message: 'Authorization failed',
            error: error.message
        });
    }
};

/**
 * Get user's consent history
 */
export const getConsentHistory = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;

        const history = await AuditLog.find({ globalDID: did })
            .sort({ timestamp: -1 })
            .limit(50)
            .select('-__v');

        res.json({
            success: true,
            data: history
        });

    } catch (error: any) {
        console.error('Error fetching consent history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch consent history',
            error: error.message
        });
    }
};

/**
 * Update user profile (for demo purposes)
 */
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;
        const profileData = req.body;

        const user = await DIDModel.findOne({ did });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.profile = { ...user.profile, ...profileData };
        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile: user.profile
        });

    } catch (error: any) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};
