import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export default function HealthCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [tokenData, setTokenData] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState('');

    // Prevent double-firing in Strict Mode
    const processedCode = useRef<string | null>(null);

    useEffect(() => {
        if (code) {
            if (processedCode.current === code) return;
            processedCode.current = code;
            exchangeToken(code);
        } else {
            setStatus('error');
            setErrorMsg('No authorization code returned');
        }
    }, [code]);

    const exchangeToken = async (authCode: string) => {
        try {
            // Emulate the "Health Portal Server" exchanging the code
            const res = await fetch('http://localhost:3000/api/oauth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: authCode,
                    // These must match what we configured in oauth.controller.ts
                    client_id: 'health_portal_client',
                    client_secret: 'health_secret'
                })
            });

            const data = await res.json();

            if (data.access_token) {
                setTokenData(data);
                setStatus('success');
                // In a real app, this is where we'd save the token and log the user into the health portal
            } else {
                setStatus('error');
                setErrorMsg(data.error || 'Failed to exchange token');
            }
        } catch (err) {
            setStatus('error');
            setErrorMsg('Network error during token exchange');
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-gray-100">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                        {/* Health Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-center mb-2">Health Portal Login</h1>

                {status === 'loading' && (
                    <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-gray-500">Verifying identity...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center">
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 flex-shrink-0" />
                            <p className="text-sm font-medium">{errorMsg}</p>
                        </div>
                        <button onClick={() => navigate('/')} className="text-gray-500 hover:text-black font-medium">
                            Return Home
                        </button>
                    </div>
                )}

                {status === 'success' && tokenData && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-full mb-4">
                                <CheckCircle className="w-4 h-4" />
                                Login Successful
                            </div>
                            <p className="text-gray-600 text-sm">
                                You have successfully authenticated using Bharat-ID.
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6 text-left">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Received Identity Token</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Shadow ID (Privacy Protected)</label>
                                    <div className="text-xs font-mono bg-white p-2 border rounded text-gray-700 break-all">
                                        {tokenData.sub}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Access Token</label>
                                    <div className="text-xs font-mono bg-white p-2 border rounded text-gray-700 truncate">
                                        {tokenData.access_token.substring(0, 20)}...
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/health')}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                            Continue to Portal <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
