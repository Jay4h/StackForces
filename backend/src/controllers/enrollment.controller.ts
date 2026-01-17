import { Request, Response } from 'express';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    type VerifiedRegistrationResponse,
    type PublicKeyCredentialCreationOptionsJSON,
    type RegistrationResponseJSON
} from '@simplewebauthn/server';
import { setSession, getSession, deleteSession } from '../config/redis';
import { DIDModel } from '../models/did.model';
import { generateDID } from '../services/cpp-bridge';

const RP_NAME = process.env.RP_NAME || 'Bharat-ID';
const RP_ID = process.env.RP_ID || 'localhost';
const EXPECTED_ORIGIN = process.env.EXPECTED_ORIGIN || 'http://localhost:5173';
const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT || '300000');

/**
 * Detect device type from user agent string
 */
function detectDeviceType(userAgent: string): 'Mobile' | 'PC' | 'Unknown' {
    if (/Android|iPhone|iPad|iPod/i.test(userAgent)) return 'Mobile';
    if (/Windows|Macintosh|Linux/i.test(userAgent)) return 'PC';
    return 'Unknown';
}

/**
 * Get friendly device name from user agent
 */
function getDeviceName(userAgent: string): string {
    if (/Windows/i.test(userAgent)) return 'Windows PC';
    if (/Macintosh/i.test(userAgent)) return 'macOS';
    if (/Linux/i.test(userAgent)) return 'Linux PC';
    if (/iPhone/i.test(userAgent)) return 'iPhone';
    if (/iPad/i.test(userAgent)) return 'iPad';
    if (/Android/i.test(userAgent)) return 'Android Phone';
    return 'Unknown Device';
}

/**
 * Start Enrollment - Generate WebAuthn Challenge
 * Step 1 of the enrollment flow
 */
export const startEnrollment = async (req: Request, res: Response) => {
    try {
        // Generate a unique user ID for this enrollment
        const userId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Generate WebAuthn registration options
        const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
            rpName: RP_NAME,
            rpID: RP_ID,
            userID: userId,
            userName: `user_${Date.now()}`,
            userDisplayName: 'Bharat Citizen',
            attestationType: 'none',
            authenticatorSelection: {
                // Allow both platform (built-in) and cross-platform (USB keys)
                // Omitting authenticatorAttachment enables both PC and mobile support
                userVerification: 'required', // Enforce biometric or PIN
                residentKey: 'preferred'
            }
        });

        // Store challenge in session store (Redis or in-memory fallback)
        const sessionKey = `enrollment:${userId}`;
        await setSession(
            sessionKey,
            JSON.stringify({
                challenge: options.challenge,
                userId,
                createdAt: Date.now()
            }),
            SESSION_TIMEOUT / 1000 // Convert to seconds
        );

        console.log(`📱 Challenge generated for user: ${userId}`);

        res.json({
            success: true,
            options
        });
    } catch (error: any) {
        console.error('❌ Error generating registration options:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start enrollment process'
        });
    }
};

/**
 * Verify Enrollment - Create Bharat-ID
 * Step 2 of the enrollment flow
 */
export const verifyEnrollment = async (req: Request, res: Response) => {
    try {
        const { credential, userId: bodyUserId }: { credential: RegistrationResponseJSON; userId?: string } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Credential is required'
            });
        }

        // Extract userId from credential response OR body (fallback)
        // userHandle might not always be set by all authenticators
        const userId = credential.response.userHandle || bodyUserId || '';

        if (!userId) {
            console.error('❌ No userId found in credential.response.userHandle or request body');
            return res.status(400).json({
                success: false,
                message: 'User ID is missing'
            });
        }

        // Retrieve challenge from session store
        const sessionKey = `enrollment:${userId}`;
        console.log(`🔍 Looking for session: ${sessionKey}`);
        const sessionData = await getSession(sessionKey);

        if (!sessionData) {
            console.error(`❌ Session not found for key: ${sessionKey}`);
            return res.status(400).json({
                success: false,
                message: 'Enrollment session expired. Please try again.'
            });
        }

        const session = JSON.parse(sessionData);

        // Verify the credential
        let verification: VerifiedRegistrationResponse;
        try {
            verification = await verifyRegistrationResponse({
                response: credential,
                expectedChallenge: session.challenge,
                expectedOrigin: EXPECTED_ORIGIN,
                expectedRPID: RP_ID
            });
        } catch (error: any) {
            console.error('❌ Verification failed:', error);
            return res.status(400).json({
                success: false,
                message: 'Biometric verification failed'
            });
        }

        if (!verification.verified || !verification.registrationInfo) {
            return res.status(400).json({
                success: false,
                message: 'Could not verify credential'
            });
        }

        // Extract public key and credential data
        const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

        // Convert public key to base64
        const publicKeyB64 = Buffer.from(credentialPublicKey).toString('base64');

        // Get device information
        const userAgent = req.headers['user-agent'] || 'unknown';
        const deviceType = detectDeviceType(userAgent);
        const deviceName = getDeviceName(userAgent);

        // Generate more unique hardware ID using credential ID + IP + user agent hash
        const crypto = require('crypto');
        const credentialIdB64 = Buffer.from(credentialID).toString('base64');
        const hardwareId = crypto
            .createHash('sha256')
            .update(credentialIdB64)
            .update(req.ip || 'unknown')
            .update(userAgent)
            .digest('hex')
            .substring(0, 32);

        // 🔒 DUPLICATE PREVENTION: Check if this device already has a Bharat-ID
        const existingByHardware = await DIDModel.findOne({ 'deviceInfo.hardwareId': hardwareId });
        const existingByCredential = await DIDModel.findOne({ credentialId: credentialIdB64 });

        if (existingByHardware || existingByCredential) {
            const existingDID = existingByHardware || existingByCredential;
            console.log(`⚠️ Duplicate enrollment attempt detected for device: ${hardwareId}`);
            return res.status(409).json({
                success: false,
                message: 'This device already has a Bharat-ID. Please login instead.',
                did: existingDID?.did,
                errorCode: 'DUPLICATE_ENROLLMENT'
            });
        }

        // Generate DID using C++ engine (or JavaScript fallback)
        console.log('🔨 Generating DID with cryptographic engine...');
        const did = generateDID(publicKeyB64, hardwareId);
        console.log(`✅ DID generated: ${did}`);

        // Save to MongoDB with enhanced device metadata
        const didDocument = new DIDModel({
            did,
            publicKey: publicKeyB64,
            deviceInfo: {
                hardwareId,
                userAgent,
                platform: 'web',
                deviceType,
                deviceName,
                authenticatorType: 'platform' // Default, could be enhanced with authenticator info
            },
            credentialId: credentialIdB64,
            counter
        });

        await didDocument.save();
        console.log(`💾 DID saved to database (Device: ${deviceType} - ${deviceName})`);

        // Clean up session
        await deleteSession(sessionKey);

        res.json({
            success: true,
            did,
            message: 'Bharat-ID created successfully'
        });

    } catch (error: any) {
        console.error('❌ Error verifying enrollment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete enrollment'
        });
    }
};
