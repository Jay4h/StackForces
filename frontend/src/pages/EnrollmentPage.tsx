import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { webAuthnClient } from '../services/webauthn-client';
import './EnrollmentPage.css';

function EnrollmentPage() {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrollmentStatus, setEnrollmentStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const [bharatId, setBharatId] = useState('');
    const [deviceType, setDeviceType] = useState<'Mobile' | 'PC' | 'Unknown'>('Unknown');
    const [hasPlatformAuth, setHasPlatformAuth] = useState(false);

    // Detect device capabilities on mount
    useEffect(() => {
        const type = webAuthnClient.detectDeviceType();
        setDeviceType(type);

        webAuthnClient.hasPlatformAuthenticator().then(has => {
            setHasPlatformAuth(has);
        });
    }, []);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const [mode, setMode] = useState<'enroll' | 'login'>('enroll');
    const [loginDID, setLoginDID] = useState('');
    const [error, setError] = useState('');

    const handleEnrollment = async () => {
        // Check if WebAuthn is supported
        if (!webAuthnClient.isSupported()) {
            setEnrollmentStatus('error');
            setStatusMessage('⚠️ Your device does not support biometric authentication. Please use a modern smartphone or laptop with fingerprint/FaceID.');
            return;
        }

        setIsEnrolling(true);
        setEnrollmentStatus('idle');
        setStatusMessage('');

        try {
            const response = await webAuthnClient.enroll();

            if (response.success && response.did) {
                setEnrollmentStatus('success');
                setBharatId(response.did);
                setStatusMessage('🎉 Your Bharat-ID has been created successfully!');

                // Save to auth context and localStorage
                login({
                    did: response.did,
                    profile: {},
                    deviceInfo: {
                        type: deviceType,
                        name: webAuthnClient.getDeviceName()
                    }
                });

                // Navigate to dashboard after brief delay
                setTimeout(() => navigate('/dashboard'), 1500);
            } else if (response.errorCode === 'DUPLICATE_ENROLLMENT') {
                setEnrollmentStatus('error');
                setStatusMessage(`⚠️ ${response.message}\n\nYour existing DID: ${response.did}`);
                setBharatId(response.did || '');
            } else {
                setEnrollmentStatus('error');
                setStatusMessage(response.message || 'Enrollment failed. Please try again.');
            }
        } catch (error: any) {
            setEnrollmentStatus('error');
            setStatusMessage(error.message || 'An unexpected error occurred');
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleLogin = async () => {
        if (!loginDID.trim() || !loginDID.startsWith('did:bharat:')) {
            setError('Please enter a valid Bharat-ID (starts with did:bharat:)');
            return;
        }

        setIsEnrolling(true);
        setEnrollmentStatus('idle');
        setStatusMessage('');
        setError('');

        try {
            const response = await webAuthnClient.login(loginDID.trim());

            if (response.success && response.did) {
                setEnrollmentStatus('success');
                setBharatId(response.did);
                setStatusMessage('✅ Login successful! Welcome back.');

                // Save to auth context and localStorage
                login({
                    did: response.did,
                    profile: response.profile || {},
                    deviceInfo: response.deviceInfo || {
                        type: deviceType,
                        name: webAuthnClient.getDeviceName()
                    }
                });

                // Navigate to dashboard after brief delay
                setTimeout(() => navigate('/dashboard'), 1500);
            } else {
                setEnrollmentStatus('idle');
                setError(response.message || 'Login failed. Please check your DID and try again.');
            }
        } catch (error: any) {
            setEnrollmentStatus('idle');
            setError(error.message || 'Login failed');
        } finally {
            setIsEnrolling(false);
        }
    };


    return (
        <div className="enrollment-page">
            <div className="enrollment-container">
                {/* Hero Section */}
                <div className="hero fade-in">
                    <div className="logo">
                        <span className="logo-icon">🇮🇳</span>
                        <h1>Bharat-ID</h1>
                    </div>
                    <p className="tagline">Your Identity. Your Control. Your Right.</p>
                </div>

                {/* Main Card */}
                <div className="card enrollment-card fade-in">
                    {enrollmentStatus === 'idle' && (
                        <>
                            {/* Mode Toggle */}
                            <div className="mode-toggle mb-3">
                                <button
                                    className={mode === 'enroll' ? 'active' : ''}
                                    onClick={() => setMode('enroll')}
                                >
                                    🆕 Create New ID
                                </button>
                                <button
                                    className={mode === 'login' ? 'active' : ''}
                                    onClick={() => setMode('login')}
                                >
                                    🔐 Login
                                </button>
                            </div>

                            {mode === 'login' ? (
                                <>
                                    <h2 className="text-center mb-3">Login with Your Bharat-ID</h2>
                                    <p className="description text-center mb-4">
                                        Already have a Bharat-ID? Enter it below and authenticate with your biometric.
                                    </p>

                                    {error && (
                                        <div className="error-alert mb-3">
                                            <span>⚠️</span>
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <div className="form-group mb-4">
                                        <label>Your Bharat-ID</label>
                                        <input
                                            type="text"
                                            placeholder="did:bharat:..."
                                            value={loginDID}
                                            onChange={(e) => setLoginDID(e.target.value)}
                                            className="did-input"
                                        />
                                        <small>Enter the DID you created during enrollment</small>
                                    </div>

                                    <button
                                        className="btn btn-primary btn-large pulse"
                                        onClick={handleLogin}
                                        disabled={isEnrolling || !loginDID.trim()}
                                    >
                                        {isEnrolling ? (
                                            <>
                                                <span className="spinner"></span>
                                                Authenticating...
                                            </>
                                        ) : (
                                            <>
                                                <span className="btn-icon">🔓</span>
                                                Login with Biometrics
                                            </>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-center mb-3">Create Your Digital Identity</h2>
                                    <p className="description text-center mb-4">
                                        Join 1.4 billion citizens in the most secure identity system.
                                        Your biometric data <strong>never leaves your device</strong>.
                                    </p>

                                    <div className="features mb-4">
                                        <div className="feature">
                                            <span className="feature-icon">🔒</span>
                                            <div>
                                                <h3>Self-Sovereign</h3>
                                                <p>You own your data, not the government</p>
                                            </div>
                                        </div>
                                        <div className="feature">
                                            <span className="feature-icon">⚡</span>
                                            <div>
                                                <h3>Instant Verification</h3>
                                                <p>No centralized database delays</p>
                                            </div>
                                        </div>
                                        <div className="feature">
                                            <span className="feature-icon">🛡️</span>
                                            <div>
                                                <h3>Privacy First</h3>
                                                <p>Zero-Knowledge Proofs prevent tracking</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary btn-large pulse"
                                        onClick={handleEnrollment}
                                        disabled={isEnrolling}
                                    >
                                        {isEnrolling ? (
                                            <>
                                                <span className="spinner"></span>
                                                Creating Your Bharat-ID...
                                            </>
                                        ) : (
                                            <>
                                                <span className="btn-icon">
                                                    {deviceType === 'Mobile' ? '👆' : deviceType === 'PC' ? '🔐' : '🆔'}
                                                </span>
                                                Create My Bharat-ID
                                            </>
                                        )}
                                    </button>

                                    <p className="note text-center mt-3">
                                        {deviceType === 'Mobile' && '📱 Touch your fingerprint sensor or use FaceID'}
                                        {deviceType === 'PC' && hasPlatformAuth && '🔐 Windows Hello or Touch ID will prompt'}
                                        {deviceType === 'PC' && !hasPlatformAuth && '🔑 USB Security Key or PIN will be requested'}
                                        {deviceType === 'Unknown' && '🔐 Your biometric will be requested'}
                                    </p>
                                </>
                            )}
                        </>
                    )}

                    {enrollmentStatus === 'success' && (
                        <div className="success-state fade-in">
                            <div className="success-icon">✅</div>
                            <h2 className="text-center mb-2">Welcome to Bharat-ID!</h2>
                            <p className="text-center mb-4">{statusMessage}</p>

                            <div className="did-display">
                                <label>Your Bharat-ID:</label>
                                <div className="did-value">{bharatId}</div>
                                <button
                                    className="btn-copy"
                                    onClick={() => navigator.clipboard.writeText(bharatId)}
                                >
                                    📋 Copy ID
                                </button>
                            </div>

                            <div className="next-steps mt-4">
                                <h3>What's Next?</h3>
                                <ul>
                                    <li>🏥 Access healthcare services instantly</li>
                                    <li>🌾 Prove land ownership for subsidies</li>
                                    <li>🏙️ Use smart city transit with a tap</li>
                                </ul>
                                <button
                                    className="btn btn-primary mt-3"
                                    onClick={() => navigate('/portals')}
                                >
                                    🚀 Try Phase 2: Access Demo Portals
                                </button>
                            </div>
                        </div>
                    )}

                    {enrollmentStatus === 'error' && (
                        <div className="error-state fade-in">
                            <div className="error-icon">❌</div>
                            <h2 className="text-center mb-2">Enrollment Failed</h2>
                            <p className="error-message text-center mb-4">{statusMessage}</p>

                            <button
                                className="btn btn-primary"
                                onClick={handleEnrollment}
                            >
                                Try Again
                            </button>

                            <div className="troubleshooting mt-4">
                                <h3>Troubleshooting:</h3>
                                <ul>
                                    <li>Ensure you're using HTTPS (required for biometrics)</li>
                                    <li>Use a modern browser (Chrome, Safari, Edge)</li>
                                    <li>Grant permission when prompted for biometric access</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="footer fade-in">
                    <p>🔐 Built with WebAuthn • 🇮🇳 Made for India</p>
                </div>
            </div>
        </div>
    );
}

export default EnrollmentPage;
