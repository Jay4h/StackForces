import { Request, Response } from 'express';
import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    type VerifiedRegistrationResponse
} from '@simplewebauthn/server';
import type {
    PublicKeyCredentialCreationOptionsJSON,
    RegistrationResponseJSON
} from '@simplewebauthn/server/dist/deps';
import redisClient from '../config/redis';
import { DIDModel } from '../models/did.model';
import { generateDID } from '../services/cpp-bridge';

const RP_NAME = process.env.RP_NAME || 'Bharat-ID';
const RP_ID = process.env.RP_ID || 'localhost';
const EXPECTED_ORIGIN = process.env.EXPECTED_ORIGIN || 'http://localhost:5173';
const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT || '300000');

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
                authenticatorAttachment: 'platform', // Use device's built-in authenticator
                userVerification: 'required', // Require biometric verification
                residentKey: 'preferred'
            }
        });

        // Store challenge in Redis with expiration
        const sessionKey = `enrollment:${userId}`;
        await redisClient.setEx(
            sessionKey,
            SESSION_TIMEOUT / 1000, // Convert to seconds
            JSON.stringify({
                challenge: options.challenge,
                userId,
                createdAt: Date.now()
            })
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
        const { credential }: { credential: RegistrationResponseJSON } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Credential is required'
            });
        }

        // Extract userId from credential response
        const userId = credential.response.userHandle || '';

        // Retrieve challenge from Redis
        const sessionKey = `enrollment:${userId}`;
        const sessionData = await redisClient.get(sessionKey);

        if (!sessionData) {
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
        const hardwareId = req.ip || 'unknown';

        // Generate DID using C++ engine (or JavaScript fallback)
        console.log('🔨 Generating DID with cryptographic engine...');
        const did = generateDID(publicKeyB64, hardwareId);
        console.log(`✅ DID generated: ${did}`);

        // Save to MongoDB
        const didDocument = new DIDModel({
            did,
            publicKey: publicKeyB64,
            deviceInfo: {
                hardwareId,
                userAgent,
                platform: 'web'
            },
            credentialId: Buffer.from(credentialID).toString('base64'),
            counter
        });

        await didDocument.save();
        console.log('💾 DID saved to database');

        // Clean up Redis session
        await redisClient.del(sessionKey);

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
