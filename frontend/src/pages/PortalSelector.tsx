import React from 'react';
import { Link } from 'react-router-dom';
import './PortalSelector.css';

const PortalSelector: React.FC = () => {
    return (
        <div className="portal-selector">
            <div className="selector-background"></div>

            <header className="selector-header">
                <h1>🇮🇳 Bharat-ID Ecosystem</h1>
                <p className="subtitle">Phase 2: Service-Specific Pairwise DIDs & Selective Disclosure</p>
            </header>

            <div className="portals-container">
                <h2>Select a Portal to Access</h2>
                <p>Each portal will request only the data it needs. You control what to share.</p>

                <div className="portals-grid">
                    <Link to="/portal/health" className="portal-card health">
                        <div className="portal-icon">🏥</div>
                        <h3>Health Portal</h3>
                        <p>Access medical records and health services</p>
                        <div className="requested-data">
                            <small>Requests:</small>
                            <div className="data-tags">
                                <span>🩸 Blood Group</span>
                                <span>👤 Full Name</span>
                                <span>📅 DOB</span>
                            </div>
                        </div>
                        <div className="portal-action">Access Portal →</div>
                    </Link>

                    <Link to="/portal/agriculture" className="portal-card agriculture">
                        <div className="portal-icon">🌾</div>
                        <h3>Agriculture Portal</h3>
                        <p>Farmer schemes and subsidy management</p>
                        <div className="requested-data">
                            <small>Requests:</small>
                            <div className="data-tags">
                                <span>🌾 Farmer Status</span>
                                <span>👤 Full Name</span>
                                <span>📍 Address</span>
                            </div>
                        </div>
                        <div className="portal-action">Access Portal →</div>
                    </Link>

                    <Link to="/portal/smartcity" className="portal-card smartcity">
                        <div className="portal-icon">🏙️</div>
                        <h3>Smart City Portal</h3>
                        <p>Urban services and citizen applications</p>
                        <div className="requested-data">
                            <small>Requests:</small>
                            <div className="data-tags">
                                <span>🏙️ Residency</span>
                                <span>👤 Full Name</span>
                                <span>📍 Address</span>
                            </div>
                        </div>
                        <div className="portal-action">Access Portal →</div>
                    </Link>
                </div>

                <div className="privacy-info">
                    <div className="privacy-icon">🛡️</div>
                    <div>
                        <h4>Your Privacy is Protected</h4>
                        <ul>
                            <li>✓ Each portal gets a unique, service-specific ID (Pairwise DID)</li>
                            <li>✓ Portals cannot track you across services</li>
                            <li>✓ You approve what data to share via biometric consent</li>
                            <li>✓ All access is logged in your consent history</li>
                        </ul>
                    </div>
                </div>

                <div className="phase-info">
                    <Link to="/" className="back-link">← Back to Enrollment</Link>
                </div>
            </div>
        </div>
    );
};

export default PortalSelector;
