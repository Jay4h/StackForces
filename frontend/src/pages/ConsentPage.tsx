
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, CheckCircle, ArrowRight, Activity, AlertCircle, Loader2 } from 'lucide-react';

export default function ConsentPage() {
    const [searchParams] = useSearchParams();
    const { user, isAuthenticated } = useAuth();

    // OAuth Params
    const clientId = searchParams.get('client_id');
    const scope = searchParams.get('scope');
    const redirectUri = searchParams.get('redirect_uri');
    const state = searchParams.get('state');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [serviceName, setServiceName] = useState('');
    const [shadowDID, setShadowDID] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated && user?.did && clientId) {
            fetchPreview();
        } else if (!isAuthenticated) {
            // In a real app, we would redirect to login with a 'returnUrl'
            // For now, assume user usually logs in first
        }
    }, [isAuthenticated, user, clientId]);

    const fetchPreview = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/oauth/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: clientId,
                    user_did: user?.did
                })
            });
            const data = await res.json();
            if (data.success) {
                setServiceName(data.serviceName);
                setShadowDID(data.shadowDID);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to load consent details');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('http://localhost:3000/api/oauth/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: clientId,
                    user_did: user?.did,
                    scope,
                    redirect_uri: redirectUri,
                    state
                })
            });
            const data = await res.json();
            if (data.success) {
                // Redirect back to the service
                window.location.href = data.callbackUrl;
            } else {
                setError('Authorization failed');
                setSubmitting(false);
            }
        } catch (err) {
            setError('Network error');
            setSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
                    <p className="text-gray-500 mb-6">Please log in to your Bharat-ID wallet to continue.</p>
                    <a href="/" className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition">Go to Login</a>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-[#1d1d1f] font-sans flex flex-col items-center justify-center p-4">
            {/* Header Logo */}
            <div className="mb-8 flex items-center gap-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white rounded-full" />
                </div>
                <span className="font-semibold text-xl tracking-tight">Bharat-ID Trust Center</span>
            </div>

            <div className="bg-white max-w-lg w-full rounded-[32px] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border border-white p-8 relative overflow-hidden">
                {/* Decorative Background Blob */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl pointer-events-none" />

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* Service Request Header */}
                <div className="text-center mb-8 relative z-10">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-sm">
                        <Activity className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">{serviceName}</h1>
                    <p className="text-gray-500">is requesting access to confirm your identity.</p>
                </div>

                {/* The "Shadow ID" Privacy Guarantee Box */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8 relative overflow-hidden group hover:border-gray-200 transition-colors">
                    <div className="flex items-start gap-4">
                        <div className="mt-1">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Privacy Protected</h3>
                            <p className="text-sm text-gray-500 leading-relaxed mb-4">
                                Your real DID is <strong>hidden</strong>. We are generating a unique "Shadow ID" for this service. They cannot track you across other apps.
                            </p>

                            {/* Visual ID Swap */}
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col gap-3">
                                <div className="flex items-center justify-between text-xs text-gray-400 uppercase tracking-wider font-semibold">
                                    <span>Global ID (Hidden)</span>
                                    <span>Shared ID (Visible)</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-8 bg-gray-100 rounded-lg flex items-center px-3 text-gray-400 text-xs font-mono select-none">
                                        did:bharat:28a...
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                    <div className="flex-1 h-8 bg-green-50 rounded-lg flex items-center px-3 text-green-700 text-xs font-mono border border-green-100 truncate">
                                        {shadowDID.substring(0, 20)}...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scope List */}
                <div className="space-y-4 mb-8">
                    <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Access Scope</h4>
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors -mx-3">
                        <CheckCircle className="w-5 h-5 text-black" />
                        <div>
                            <p className="font-medium text-gray-900">Verify Identity</p>
                            <p className="text-sm text-gray-500">Confirm you are a real person without revealing PII.</p>
                        </div>
                    </div>
                    {scope?.includes('health') && (
                        <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors -mx-3">
                            <CheckCircle className="w-5 h-5 text-black" />
                            <div>
                                <p className="font-medium text-gray-900">Health Record Linkage</p>
                                <p className="text-sm text-gray-500">Allow this ID to be associated with medical records.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleConfirm}
                        disabled={submitting}
                        className="w-full py-4 bg-black text-white rounded-2xl font-semibold text-lg hover:bg-gray-900 active:scale-[0.98] transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Authenticate'}
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full py-4 bg-transparent text-gray-500 rounded-2xl font-medium hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <p className="mt-8 text-xs text-gray-400 text-center max-w-sm leading-relaxed">
                By authenticating, you agree to the Terms of Service. This action is secured by hardware-backed cryptography.
            </p>
        </div>
    );
}
