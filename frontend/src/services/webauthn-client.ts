import {
    startRegistration,
    startAuthentication,
    type PublicKeyCredentialCreationOptionsJSON,
    type RegistrationResponseJSON
} from '@simplewebauthn/browser';
import axios from 'axios';

// Auto-detect backend URL based on current host
// If running on ngrok, try to use ngrok backend URL
// Otherwise use localhost or env variable
const getApiBaseUrl = (): string => {
    // Use environment variable if set
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // If running on ngrok frontend, try to construct backend URL
    // (This assumes backend ngrok URL follows similar pattern)
    const currentHost = window.location.hostname;
    if (currentHost.includes('ngrok-free.app') || currentHost.includes('ngrok.io')) {
        // For ngrok, you'll need to set VITE_API_URL in .env file
        // with your backend ngrok URL
        console.warn('⚠️ Running on ngrok but VITE_API_URL not set. Please create frontend/.env with: VITE_API_URL=https://YOUR-BACKEND-NGROK-URL.ngrok-free.app/api');
        return 'http://localhost:3000/api'; // Fallback
    }

    // Default to localhost
    return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

interface EnrollmentOptions {
    options: PublicKeyCredentialCreationOptionsJSON;
}

interface EnrollmentResponse {
    success: boolean;
    did?: string;
    message?: string;
    errorCode?: string;
    profile?: any;
    deviceInfo?: {
        type: string;
        name: string;
    };
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

            // Extract and store userId for later use
            const userId = options.user.id;
            console.log('👤 User ID:', userId);

            // Step 2: Trigger biometric prompt (fingerprint/FaceID)
            console.log('🔐 Triggering biometric prompt...');
            const credential: RegistrationResponseJSON = await startRegistration(options);

            console.log('✅ Biometric captured, public key generated');

            // Step 3: Send credential to backend for verification
            // Include userId as fallback in case userHandle is not set
            console.log('📤 Sending credential to backend...');
            const verifyResponse = await axios.post<EnrollmentResponse>(
                `${API_BASE_URL}/enrollment/verify`,
                { credential, userId }
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
                return {
                    success: false,
                    message: error.response.data.message,
                    did: error.response.data.did,
                    errorCode: error.response.data.errorCode
                };
            } else {
                throw new Error('Enrollment failed. Please try again.');
            }
        }
    }

    /**
     * Login with existing Bharat-ID
     */
    async login(did: string): Promise<EnrollmentResponse> {
        try {
            console.log('🔐 Starting login for DID:', did);

            // Step 1: Get authentication challenge
            const challengeResponse = await axios.post(
                `${API_BASE_URL}/enrollment/login/start`,
                { did }
            );

            const { challenge, sessionId, allowCredentials, rpId, userVerification } = challengeResponse.data;
            console.log('✅ Challenge received');

            // Step 2: Trigger biometric authentication
            console.log('👆 Triggering biometric authentication...');
            const authResponse = await startAuthentication({
                challenge,
                allowCredentials,
                rpId,
                userVerification
            });

            console.log('✅ Biometric verified');

            // Step 3: Verify authentication
            const verifyResponse = await axios.post<EnrollmentResponse>(
                `${API_BASE_URL}/enrollment/login/verify`,
                { authResponse, sessionId }
            );

            console.log('🎉 Login successful:', verifyResponse.data);
            return verifyResponse.data;

        } catch (error: any) {
            console.error('❌ Login failed:', error);

            if (error.name === 'NotAllowedError') {
                throw new Error('Biometric authentication was cancelled');
            } else if (error.response?.data?.message) {
                return {
                    success: false,
                    message: error.response.data.message
                };
            } else {
                throw new Error('Login failed. Please try again.');
            }
        }
    }

    /**
     * Check if WebAuthn is supported on this device
     */
    isSupported(): boolean {
        return window?.PublicKeyCredential !== undefined;
    }

    /**
     * Check if platform authenticator (built-in biometrics) is available
     */
    async hasPlatformAuthenticator(): Promise<boolean> {
        if (!this.isSupported()) return false;
        try {
            return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        } catch {
            return false;
        }
    }

    /**
     * Detect the current device type
     */
    detectDeviceType(): 'Mobile' | 'PC' | 'Unknown' {
        const ua = navigator.userAgent;
        if (/Android|iPhone|iPad|iPod/i.test(ua)) return 'Mobile';
        if (/Windows|Macintosh|Linux/i.test(ua)) return 'PC';
        return 'Unknown';
    }

    /**
     * Get a friendly device name
     */
    getDeviceName(): string {
        const ua = navigator.userAgent;
        if (/Windows/i.test(ua)) return 'Windows PC';
        if (/Macintosh/i.test(ua)) return 'macOS';
        if (/Linux/i.test(ua)) return 'Linux PC';
        if (/iPhone/i.test(ua)) return 'iPhone';
        if (/iPad/i.test(ua)) return 'iPad';
        if (/Android/i.test(ua)) return 'Android Phone';
        return 'Unknown Device';
    }
}

export const webAuthnClient = new WebAuthnClient();
