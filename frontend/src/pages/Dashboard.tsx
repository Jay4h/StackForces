import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        fullName: user?.profile?.fullName || '',
        bloodGroup: user?.profile?.bloodGroup || '',
        farmerStatus: user?.profile?.farmerStatus || '',
        residencyStatus: user?.profile?.residencyStatus || '',
        dateOfBirth: user?.profile?.dateOfBirth || '',
        address: user?.profile?.address || '',
        phone: user?.profile?.phone || ''
    });

    const handleUpdateProfile = async () => {
        try {
            // Update backend
            const response = await fetch(`http://localhost:3000/api/service/profile/${user?.did}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileForm)
            });

            if (response.ok) {
                updateProfile(profileForm);
                setIsEditingProfile(false);
                alert('✅ Profile updated successfully!');
            } else {
                alert('❌ Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('❌ Error updating profile');
        }
    };

    const copyDID = () => {
        if (user?.did) {
            navigator.clipboard.writeText(user.did);
            alert('✅ DID copied to clipboard!');
        }
    };

    return (
        <div className="dashboard-page">
            <Header />

            <main className="dashboard-container">
                {/* Welcome Section */}
                <section className="welcome-section">
                    <div className="welcome-card">
                        <h1>Welcome, {user?.profile?.fullName || 'Bharat Citizen'}! 👋</h1>
                        <p>Your decentralized identity is ready. Access services with privacy and control.</p>
                    </div>
                </section>

                {/* Identity Card */}
                <section className="identity-section">
                    <div className="identity-card">
                        <div className="card-header">
                            <h2>🆔 Your Bharat-ID</h2>
                            <span className="badge-verified">✓ Verified</span>
                        </div>
                        <div className="did-display">
                            <code>{user?.did}</code>
                            <button onClick={copyDID} className="btn-copy">
                                📋 Copy
                            </button>
                        </div>
                        <div className="device-info">
                            <span className="info-label">Registered Device:</span>
                            <span className="info-value">
                                {user?.deviceInfo?.name || 'Unknown Device'}
                            </span>
                        </div>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="actions-section">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                        <button
                            className="action-card health"
                            onClick={() => navigate('/portal/health')}
                        >
                            <span className="action-icon">🏥</span>
                            <h3>Health Services</h3>
                            <p>Access medical records</p>
                        </button>

                        <button
                            className="action-card agriculture"
                            onClick={() => navigate('/portals')}
                        >
                            <span className="action-icon">🌾</span>
                            <h3>Agriculture Portal</h3>
                            <p>Farmer subsidies & schemes</p>
                        </button>

                        <button
                            className="action-card smartcity"
                            onClick={() => navigate('/portals')}
                        >
                            <span className="action-icon">🏙️</span>
                            <h3>Smart City</h3>
                            <p>Urban services & utilities</p>
                        </button>

                        <button
                            className="action-card profile"
                            onClick={() => setIsEditingProfile(true)}
                        >
                            <span className="action-icon">📝</span>
                            <h3>Update Profile</h3>
                            <p>Manage your information</p>
                        </button>
                    </div>
                </section>

                {/* Profile Section */}
                <section className="profile-section">
                    <div className="profile-card">
                        <div className="card-header">
                            <h2>📋 Your Profile</h2>
                            {!isEditingProfile && (
                                <button
                                    onClick={() => setIsEditingProfile(true)}
                                    className="btn-edit"
                                >
                                    ✏️ Edit
                                </button>
                            )}
                        </div>

                        {isEditingProfile ? (
                            <div className="profile-form">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={profileForm.fullName}
                                            onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Blood Group</label>
                                        <select
                                            value={profileForm.bloodGroup}
                                            onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                                        >
                                            <option value="">Select</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date of Birth</label>
                                        <input
                                            type="date"
                                            value={profileForm.dateOfBirth}
                                            onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input
                                            type="tel"
                                            value={profileForm.phone}
                                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                            placeholder="+91-XXXXXXXXXX"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Farmer Status</label>
                                        <select
                                            value={profileForm.farmerStatus}
                                            onChange={(e) => setProfileForm({ ...profileForm, farmerStatus: e.target.value })}
                                        >
                                            <option value="">Select</option>
                                            <option value="Active Farmer">Active Farmer</option>
                                            <option value="Not a Farmer">Not a Farmer</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Residency Status</label>
                                        <select
                                            value={profileForm.residencyStatus}
                                            onChange={(e) => setProfileForm({ ...profileForm, residencyStatus: e.target.value })}
                                        >
                                            <option value="">Select</option>
                                            <option value="Permanent Resident">Permanent Resident</option>
                                            <option value="Temporary Resident">Temporary Resident</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Address</label>
                                    <textarea
                                        value={profileForm.address}
                                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                                        placeholder="Enter your full address"
                                        rows={3}
                                    />
                                </div>

                                <div className="form-actions">
                                    <button onClick={() => setIsEditingProfile(false)} className="btn-cancel">
                                        Cancel
                                    </button>
                                    <button onClick={handleUpdateProfile} className="btn-save">
                                        💾 Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="profile-display">
                                <div className="profile-grid">
                                    <div className="profile-item">
                                        <span className="item-label">Full Name:</span>
                                        <span className="item-value">{user?.profile?.fullName || 'Not set'}</span>
                                    </div>
                                    <div className="profile-item">
                                        <span className="item-label">Blood Group:</span>
                                        <span className="item-value">{user?.profile?.bloodGroup || 'Not set'}</span>
                                    </div>
                                    <div className="profile-item">
                                        <span className="item-label">Date of Birth:</span>
                                        <span className="item-value">{user?.profile?.dateOfBirth || 'Not set'}</span>
                                    </div>
                                    <div className="profile-item">
                                        <span className="item-label">Phone:</span>
                                        <span className="item-value">{user?.profile?.phone || 'Not set'}</span>
                                    </div>
                                    <div className="profile-item">
                                        <span className="item-label">Farmer Status:</span>
                                        <span className="item-value">{user?.profile?.farmerStatus || 'Not set'}</span>
                                    </div>
                                    <div className="profile-item">
                                        <span className="item-label">Residency Status:</span>
                                        <span className="item-value">{user?.profile?.residencyStatus || 'Not set'}</span>
                                    </div>
                                    <div className="profile-item full-width">
                                        <span className="item-label">Address:</span>
                                        <span className="item-value">{user?.profile?.address || 'Not set'}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Privacy Notice */}
                <section className="privacy-notice">
                    <div className="notice-card">
                        <span className="notice-icon">🛡️</span>
                        <div>
                            <h3>Your Privacy is Protected</h3>
                            <p>Your profile data is encrypted and only shared with services you explicitly approve. Each service gets a unique, service-specific ID (Pairwise DID) to prevent cross-service tracking.</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
