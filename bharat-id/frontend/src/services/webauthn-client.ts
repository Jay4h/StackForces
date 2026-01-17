import { startRegistration } from '@simplewebauthn/browser';
import type {
    PublicKeyCredentialCreationOptionsJSON,
    RegistrationResponseJSON
} from '@simplewebauthn/browser';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface EnrollmentOptions {
    options: PublicKeyCredentialCreationOptionsJSON;
}

interface EnrollmentResponse {
    success: boolean;
    did?: string;
    message?: string;
}

/**
 * WebAuthn Client Service
 * Handles biometric enrollment and authentication
 */
class WebAuthnClient {
    /**
     * Start the enrollment process
     * Step 1: Get challenge from backend
     * Step 2: Trigger biometric prompt
     * Step 3: Send credential to backend
     */
    async enroll(): Promise<EnrollmentResponse> {
        try {
            // Step 1: Get registration options from backend
            console.log('📱 Requesting registration challenge...');
            const optionsResponse = await axios.post<EnrollmentOptions>(
                `${API_BASE_URL}/enrollment/start`
            );

            const { options } = optionsResponse.data;
            console.log('✅ Challenge received:', options.challenge);

            // Step 2: Trigger biometric prompt (fingerprint/FaceID)
            console.log('🔐 Triggering biometric prompt...');
            const credential: RegistrationResponseJSON = await startRegistration(options);

            console.log('✅ Biometric captured, public key generated');

            // Step 3: Send credential to backend for verification
            console.log('📤 Sending credential to backend...');
            const verifyResponse = await axios.post<EnrollmentResponse>(
                `${API_BASE_URL}/enrollment/verify`,
                { credential }
            );

            console.log('🎉 Enrollment complete:', verifyResponse.data);
            return verifyResponse.data;

        } catch (error: any) {
            console.error('❌ Enrollment failed:', error);

            // Handle specific errors
            if (error.name === 'NotAllowedError') {
                throw new Error('Biometric authentication was cancelled or not allowed');
            } else if (error.name === 'NotSupportedError') {
                throw new Error('This device does not support biometric authentication');
            } else if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else {
                throw new Error('Enrollment failed. Please try again.');
            }
        }
    }

    /**
     * Check if WebAuthn is supported on this device
     */
    isSupported(): boolean {
        return window?.PublicKeyCredential !== undefined;
    }
}

export const webAuthnClient = new WebAuthnClient();
