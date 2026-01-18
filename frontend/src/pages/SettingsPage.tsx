import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
    Shield,
    Key,
    Smartphone,
    LogOut,
    Copy,
    Check,
    Eye,
    EyeOff,
    Settings,
    User,
    Activity,
    Globe,
    Lock
} from 'lucide-react';

export default function SettingsPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();
    const [showPublicKey, setShowPublicKey] = useState(false);
    const [copiedDID, setCopiedDID] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);

    const handleCopy = (text: string, type: 'did' | 'key') => {
        navigator.clipboard.writeText(text);
        if (type === 'did') {
            setCopiedDID(true);
            setTimeout(() => setCopiedDID(false), 2000);
        } else {
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        }
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to terminate this session?')) {
            logout();
            navigate('/');
        }
    };

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen bg-[#FDFDFD]">
                <Navbar />
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-center space-y-6 animate-fade-in-up">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
                            <Shield className="w-10 h-10 text-blue-600" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Access Restricted</h2>
                            <p className="text-slate-500 text-lg">Please authenticate your identity to view settings</p>
                        </div>
                        <button
                            onClick={() => navigate('/enroll')}
                            className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
                        >
                            Connect Identity
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Navbar />

            <main className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                                <Settings className="w-8 h-8 text-blue-600" />
                                Settings & Privacy
                            </h1>
                            <p className="text-lg text-slate-500 font-medium">Manage your decentralized identity foundation</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-100">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            System Operational
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Main Identity Info */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Identity Card */}
                            <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <User className="w-32 h-32" />
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                            <span className="text-2xl font-bold text-white">ID</span>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900">Digital Identity</h2>
                                            <p className="text-slate-500 font-medium">Sovereign Credentials</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* DID Field */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-blue-500" />
                                                Bharat-ID (DID)
                                            </label>
                                            <div className="group/input relative transition-all">
                                                <div className="absolute inset-0 bg-blue-50/50 rounded-xl transition-all group-hover/input:bg-blue-50" />
                                                <input
                                                    type="text"
                                                    value={user.did}
                                                    readOnly
                                                    className="w-full relative bg-transparent px-5 py-4 rounded-xl border-2 border-slate-100 font-mono text-sm text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors pr-14"
                                                />
                                                <button
                                                    onClick={() => handleCopy(user.did, 'did')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-100/50 transition-all"
                                                >
                                                    {copiedDID ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Public Key Field */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                <Key className="w-4 h-4 text-emerald-500" />
                                                Public Verification Key
                                            </label>
                                            <div className="group/input relative">
                                                <div className="absolute inset-0 bg-emerald-50/30 rounded-xl transition-all group-hover/input:bg-emerald-50/50" />
                                                <input
                                                    type={showPublicKey ? 'text' : 'password'}
                                                    value={user.publicKey}
                                                    readOnly
                                                    className="w-full relative bg-transparent px-5 py-4 rounded-xl border-2 border-slate-100 font-mono text-sm text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors pr-28"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                    <button
                                                        onClick={() => setShowPublicKey(!showPublicKey)}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-100/50 transition-all"
                                                    >
                                                        {showPublicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleCopy(user.publicKey, 'key')}
                                                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-100/50 transition-all"
                                                    >
                                                        {copiedKey ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-400 pl-1">
                                                This key allows services to verify your signatures without exposing your private key.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Trust Banner */}
                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10 flex items-start gap-4">
                                    <div className="p-3 bg-white/10 rounded-xl">
                                        <Lock className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-2">Cryptographic Guarantee</h3>
                                        <p className="text-slate-300 leading-relaxed">
                                            Your identity is mathematically proven. Private keys never leave your device's secure enclave.
                                            You are the sole custodian of your digital presence.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Device & Actions */}
                        <div className="space-y-8">

                            {/* Device Info Card */}
                            <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-fit">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                        <Smartphone className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Device Telemetry</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Fingerprint</div>
                                        <div className="font-mono text-sm text-slate-700 truncate" title={user.deviceInfo?.hardwareId}>
                                            {user.deviceInfo?.hardwareId || 'N/A'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Type</div>
                                            <div className="font-semibold text-slate-700">{user.deviceInfo?.deviceType || 'Unknown'}</div>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Platform</div>
                                            <div className="font-semibold text-slate-700 truncate" title={user.deviceInfo?.deviceName}>
                                                {user.deviceInfo?.deviceName || 'Web'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                                        <Activity className="w-5 h-5 text-emerald-500" />
                                        <div>
                                            <div className="text-xs font-semibold text-emerald-600 uppercase">Enrolled On</div>
                                            <div className="text-sm font-medium text-emerald-900">
                                                {user.enrolledAt ? new Date(user.enrolledAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }) : 'Unknown'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Danger / Action Zone */}
                            <section className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full group flex items-center justify-between p-6 rounded-[20px] hover:bg-rose-50 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-rose-100 rounded-xl text-rose-600 group-hover:bg-rose-200 transition-colors">
                                            <LogOut className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-slate-900 group-hover:text-rose-700 transition-colors">Terminate Session</h3>
                                            <p className="text-sm text-slate-500 group-hover:text-rose-600/70">Safe logout from this device</p>
                                        </div>
                                    </div>
                                </button>
                            </section>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
