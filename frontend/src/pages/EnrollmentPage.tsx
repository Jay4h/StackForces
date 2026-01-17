import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { webAuthnClient } from '../services/webauthn-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function EnrollmentPage() {
    const navigate = useNavigate();
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [did, setDid] = useState('');
    const [deviceType, setDeviceType] = useState('Unknown');

    useEffect(() => {
        setDeviceType(webAuthnClient.detectDeviceType());
    }, []);

    const handleEnrollment = async () => {
        setIsEnrolling(true);
        setStatus('idle');

        try {
            const response = await webAuthnClient.enroll();
            if (response.success && response.did) {
                setStatus('success');
                setDid(response.did);
                setTimeout(() => navigate('/home'), 2500);
            } else {
                throw new Error(response.message || 'Enrollment failed');
            }
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'Authentication failed. Please try again.');
        } finally {
            setIsEnrolling(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[440px] bg-white rounded-[28px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] border border-white/50 p-10 relative overflow-hidden"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6 border border-gray-100"
                    >
                        {status === 'success' ? (
                            <ShieldCheck size={40} className="text-green-500" />
                        ) : status === 'error' ? (
                            <AlertCircle size={40} className="text-red-500" />
                        ) : (
                            <Fingerprint size={40} className="text-[#0071e3]" />
                        )}
                    </motion.div>

                    <h1 className="text-2xl font-semibold text-[#1d1d1f] mb-2">
                        {status === 'success' ? 'Identity Verified' : 'Create Your Praman-ID'}
                    </h1>
                    <p className="text-[#86868b] text-[15px] leading-relaxed">
                        {status === 'success'
                            ? 'Welcome to the future of identity.'
                            : 'Use your device biometrics to create a secure, self-sovereign digital identity.'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {status === 'idle' || status === 'error' ? (
                        <motion.div
                            key="action"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            <button
                                onClick={handleEnrollment}
                                disabled={isEnrolling}
                                className="w-full bg-[#0071e3] hover:bg-[#0077ED] text-white font-medium py-[14px] rounded-xl text-[15px] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isEnrolling ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Securely Authenticating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Continue with {deviceType === 'Mobile' ? 'FaceID' : 'Touch ID'}</span>
                                        <Lock size={16} className="opacity-70" />
                                    </>
                                )}
                            </button>

                            {status === 'error' && (
                                <p className="text-center text-red-500 text-sm bg-red-50 py-2 rounded-lg">{message}</p>
                            )}

                            <div className="pt-6 flex items-center justify-center gap-2 text-xs text-[#86868b]">
                                <ShieldCheck size={12} />
                                <span>Your biometrics never leave this device.</span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300"
                        >
                            <div className="text-xs text-[#86868b] uppercase tracking-widest mb-2">Your New DID</div>
                            <div className="font-mono text-sm text-[#1d1d1f] break-all select-all font-medium">
                                {did}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-[#86868b] text-xs">
                    Protected by Government-grade encryption.<br />
                    Powered by Praman C++ Cryptographic Engine.
                </p>
            </div>
        </div>
    );
}
