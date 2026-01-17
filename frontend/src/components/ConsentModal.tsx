import React, { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import '../styles/ConsentModal.css';

interface ConsentModalProps {
    isOpen: boolean;
    serviceName: string;
    serviceDisplayName: string;
    requestedFields: string[];
    pairwiseDID?: string;
    onConsent: (consentedFields: string[]) => Promise<void>;
    onCancel: () => void;
}

const FIELD_LABELS: Record<string, string> = {
    bloodGroup: '🩸 Blood Group',
    farmerStatus: '🌾 Farmer Status',
    residencyStatus: '🏙️ Residency Status',
    fullName: '👤 Full Name',
    dateOfBirth: '📅 Date of Birth',
    address: '📍 Address',
    phone: '📞 Phone Number'
};

const ConsentModal: React.FC<ConsentModalProps> = ({
    isOpen,
    serviceName,
    serviceDisplayName,
    requestedFields,
    pairwiseDID,
    onConsent,
    onCancel
}) => {
    const [selectedFields, setSelectedFields] = useState<string[]>(requestedFields);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handleFieldToggle = (field: string) => {
        setSelectedFields(prev =>
            prev.includes(field)
                ? prev.filter(f => f !== field)
                : [...prev, field]
        );
    };

    const handleConfirm = async () => {
        if (selectedFields.length === 0) {
            alert('Please select at least one field to share');
            return;
        }

        setIsProcessing(true);
        try {
            await onConsent(selectedFields);
        } catch (error) {
            console.error('Consent error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="consent-modal-overlay">
            <div className="consent-modal">
                <div className="consent-header">
                    <div className="consent-icon">🔐</div>
                    <h2>Data Sharing Request</h2>
                    <p className="service-name">{serviceDisplayName}</p>
                </div>

                <div className="consent-body">
                    <div className="privacy-notice">
                        <span className="shield-icon">🛡️</span>
                        <div>
                            <strong>Your Privacy is Protected</strong>
                            <p>Only the data you approve will be shared. You can change your selection anytime.</p>
                        </div>
                    </div>

                    {pairwiseDID && (
                        <div className="pairwise-did-box">
                            <label>Service-Specific ID (Pairwise DID)</label>
                            <code>{pairwiseDID}</code>
                            <small>This unique ID is only for {serviceDisplayName} and cannot be linked to other services.</small>
                        </div>
                    )}

                    <div className="fields-list">
                        <h3>Select data to share:</h3>
                        {requestedFields.map(field => (
                            <label key={field} className="field-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedFields.includes(field)}
                                    onChange={() => handleFieldToggle(field)}
                                />
                                <span className="field-label">
                                    {FIELD_LABELS[field] || field}
                                </span>
                                <span className="required-badge">Requested</span>
                            </label>
                        ))}
                    </div>

                    <div className="consent-footer">
                        <p className="biometric-notice">
                            <span className="fingerprint-icon">👆</span>
                            You'll be asked to verify with your fingerprint/face ID
                        </p>
                    </div>
                </div>

                <div className="consent-actions">
                    <button
                        className="btn-cancel"
                        onClick={onCancel}
                        disabled={isProcessing}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-confirm"
                        onClick={handleConfirm}
                        disabled={isProcessing || selectedFields.length === 0}
                    >
                        {isProcessing ? (
                            <>
                                <span className="spinner"></span>
                                Verifying...
                            </>
                        ) : (
                            <>
                                <span className="lock-icon">🔓</span>
                                Confirm with Biometrics
                            </>
                        )}
                    </button>
                </div>

                <div className="audit-notice">
                    <small>✓ This action will be logged in your consent history</small>
                </div>
            </div>
        </div>
    );
};

export default ConsentModal;
