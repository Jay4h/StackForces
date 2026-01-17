import React, { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import ConsentModal from '../components/ConsentModal';
import '../styles/HealthPortal.css';

const HealthPortal: React.FC = () => {
    const [userDID, setUserDID] = useState('');
    const [showConsent, setShowConsent] = useState(false);
    const [authData, setAuthData] = useState<any>(null);
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const serviceName = 'health';
    const serviceConfig = {
        name: 'health',
        displayName: 'Bharat Health Portal',
        requestedFields: ['bloodGroup', 'fullName', 'dateOfBirth']
    };

    const handleLogin = async () => {
        if (!userDID.trim()) {
            setError('Please enter your Bharat-ID');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Step 1: Request authentication challenge
            const challengeResp = await fetch('http://localhost:3000/api/service/challenge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ did: userDID.trim(), serviceName })
            });

            const challengeData = await challengeResp.json();

            if (!challengeData.success) {
                throw new Error(challengeData.message);
            }

            // Store auth data for later
            setAuthData(challengeData);
            setShowConsent(true);

        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleConsent = async (consentedFields: string[]) => {
        if (!authData) return;

        try {
            // Step 2: Show biometric prompt
            const authResponse = await startAuthentication({
                challenge: authData.challenge,
                allowCredentials: authData.allowCredentials,
                rpId: authData.rpId,
                userVerification: authData.userVerification
            });

            // Step 3: Send to backend for verification and pairwise DID generation
            const authResp = await fetch('http://localhost:3000/api/service/authorize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    did: userDID,
                    serviceName,
                    authResponse,
                    sessionId: authData.sessionId,
                    expectedChallenge: authData.challenge,
                    consentedFields
                })
            });

            const result = await authResp.json();

            if (!result.success) {
                throw new Error(result.message);
            }

            // Store profile data
            setProfileData(result.data);
            setShowConsent(false);

        } catch (err: any) {
            console.error('Consent error:', err);
            setError(err.message || 'Authorization failed');
            setShowConsent(false);
        }
    };

    const handleLogout = () => {
        setUserDID('');
        setProfileData(null);
        setAuthData(null);
    };

    return (
        <div className="health-portal">
            <div className="health-background">
                <div className="health-gradient"></div>
                <div className="health-pattern"></div>
            </div>

            <header className="health-header">
                <div className="header-content">
                    <div className="logo">
                        <span className="logo-icon">🏥</span>
                        <div>
                            <h1>Bharat Health Portal</h1>
                            <p>National Digital Health Mission</p>
                        </div>
                    </div>
                    {profileData && (
                        <button className="btn-logout" onClick={handleLogout}>
                            Logout
                        </button>
                    )}
                </div>
            </header>

            <main className="health-main">
                {!profileData ? (
                    <div className="login-section">
                        <div className="login-card">
                            <div className="card-header">
                                <h2>🔐 Secure Health Access</h2>
                                <p>Login with your Bharat-ID to access health services</p>
                            </div>

                            <div className="card-body">
                                {error && (
                                    <div className="error-alert">
                                        <span>⚠️</span>
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Your Bharat-ID (DID)</label>
                                    <input
                                        type="text"
                                        placeholder="did:bharat:..."
                                        value={userDID}
                                        onChange={(e) => setUserDID(e.target.value)}
                                        className="did-input"
                                    />
                                    <small>Enter the DID you created during enrollment</small>
                                </div>

                                <button
                                    className="btn-primary"
                                    onClick={handleLogin}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner"></span>
                                            Connecting...
                                        </>
                                    ) : (
                                        <>
                                            <span>🔓</span>
                                            Login with Biometrics
                                        </>
                                    )}
                                </button>

                                <div className="security-badges">
                                    <div className="badge">🛡️ HIPAA Compliant</div>
                                    <div className="badge">🔒 End-to-End Encrypted</div>
                                    <div className="badge">✓ Zero-Knowledge Proof</div>
                                </div>
                            </div>
                        </div>

                        <div className="features-grid">
                            <div className="feature-card">
                                <span className="feature-icon">🩺</span>
                                <h3>Health Records</h3>
                                <p>Access your medical history securely</p>
                            </div>
                            <div className="feature-card">
                                <span className="feature-icon">💊</span>
                                <h3>Prescriptions</h3>
                                <p>Digital prescriptions from doctors</p>
                            </div>
                            <div className="feature-card">
                                <span className="feature-icon">📊</span>
                                <h3>Lab Reports</h3>
                                <p>View and share test results</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="dashboard-section">
                        <div className="welcome-card">
                            <h2>Welcome back, {profileData.profile.fullName || 'User'}! 👋</h2>
                            <p>Your health data is protected by Service-Specific Pairwise DID</p>
                        </div>

                        <div className="profile-grid">
                            <div className="info-card">
                                <h3>🆔 Service-Specific Identity</h3>
                                <div className="did-display">
                                    <code>{profileData.pairwiseDID}</code>
                                </div>
                                <small>This ID is unique to Health Portal only</small>
                            </div>

                            <div className="info-card">
                                <h3>📋 Shared Information</h3>
                                {profileData.sharedFields.map((field: string) => (
                                    <div key={field} className="data-row">
                                        <span className="data-label">{field}:</span>
                                        <span className="data-value">{profileData.profile[field] || 'Not set'}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="info-card privacy-card">
                                <h3>🛡️ Your Privacy</h3>
                                <ul>
                                    <li>✓ Only selected data was shared</li>
                                    <li>✓ Health portal cannot access other services</li>
                                    <li>✓ All access logged in consent history</li>
                                    <li>✓ You can revoke access any time</li>
                                </ul>
                            </div>
                        </div>

                        <div className="success-note">
                            <span className="success-icon">✅</span>
                            <div>
                                <strong>Phase 2 Demo Complete!</strong>
                                <p>You've successfully authenticated using pairwise DIDs and selective disclosure</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {showConsent && (
                <ConsentModal
                    isOpen={showConsent}
                    serviceName={serviceName}
                    serviceDisplayName={serviceConfig.displayName}
                    requestedFields={serviceConfig.requestedFields}
                    onConsent={handleConsent}
                    onCancel={() => setShowConsent(false)}
                />
            )}
        </div>
    );
};

export default HealthPortal;
