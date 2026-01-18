import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import FamilyManager from '../components/FamilyManager';
import { Activity, FileText, Lock, Check, ChevronRight, Plus, CheckCircle, XCircle, Trash2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Role = 'citizen' | 'doctor' | 'patient' | 'healthcare_provider' | 'policy_maker' | 'government' | 'admin';

export default function HealthPortalPage() {
    const navigate = useNavigate();
    const { user, profile, isAuthenticated } = useAuth();
    const [step, setStep] = useState<'role-select' | 'login' | 'dashboard'>('role-select');
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [pairwiseDID, setPairwiseDID] = useState<string | null>(null);
    const [healthData, setHealthData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Form and UI States
    const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
    const [hideIdentity, setHideIdentity] = useState(false);
    const [newRecord, setNewRecord] = useState<any>({
        type: 'Status',
        title: '',
        description: '',
        hospital: '',
        doctor: ''
    });

    const API_BASE_URL = 'http://localhost:3000/api';

    const roles = [
        { id: 'citizen', name: 'Citizen', icon: '👤', desc: 'General public access' },
        { id: 'patient', name: 'Patient', icon: '🏥', desc: 'View your medical records' },
        { id: 'doctor', name: 'Doctor', icon: '⚕️', desc: 'View and manage patient records' },
        { id: 'healthcare_provider', name: 'Healthcare Provider', icon: '🏨', desc: 'Hospital or clinic staff' },
        { id: 'policy_maker', name: 'Policy Maker', icon: '📊', desc: 'View health analytics' },
        { id: 'government', name: 'Government Body', icon: '🏛️', desc: 'Regulatory oversight' },
        { id: 'admin', name: 'System Administrator', icon: '⚙️', desc: 'Full system access' }
    ];

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate('/enroll');
            return;
        }

        // Check for existing health portal session
        const healthSession = localStorage.getItem('health_portal_session');
        if (healthSession) {
            try {
                const session = JSON.parse(healthSession);
                if (session.did === user.did) {
                    setSelectedRole(session.role);
                    setPairwiseDID(session.pairwiseDID);
                    setStep(session.step || 'dashboard');
                    if (session.pairwiseDID && session.step === 'dashboard') {
                        fetchHealthData(session.pairwiseDID);
                    }
                    return;
                }
            } catch (error) {
                console.log('Invalid session, clearing');
                localStorage.removeItem('health_portal_session');
            }
        }
        checkExistingRegistration();
    }, [isAuthenticated, user]);

    const checkExistingRegistration = async () => {
        if (!user?.did) return;
        try {
            const res = await fetch(`${API_BASE_URL}/health/role/${user.did}`);
            const data = await res.json();
            if (data.success) {
                setSelectedRole(data.role);
                // Auto-save session
                const session = {
                    did: user.did,
                    role: data.role,
                    pairwiseDID: null,
                    step: 'login'
                };
                localStorage.setItem('health_portal_session', JSON.stringify(session));
                setStep('login');
            }
        } catch (error) {
            console.log('No existing registration');
        }
    };

    const handleRegister = async () => {
        if (!selectedRole || !user?.did) return;
        setLoading(true);
        try {
            // Simplified registration: Don't ask for personal info, backend fetches from Profile
            const res = await fetch(`${API_BASE_URL}/health/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    globalDID: user.did,
                    role: selectedRole
                })
            });
            const data = await res.json();
            if (data.success) {
                setPairwiseDID(data.healthUser.pairwiseDID);
                const session = {
                    did: user.did,
                    role: selectedRole,
                    pairwiseDID: data.healthUser.pairwiseDID,
                    step: 'login'
                };
                localStorage.setItem('health_portal_session', JSON.stringify(session));
                setStep('login');
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            alert('Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!user?.did) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/health/role-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ globalDID: user.did })
            });
            const data = await res.json();
            if (data.success) {
                setPairwiseDID(data.healthUser.pairwiseDID);
                setSelectedRole(data.healthUser.role);
                const session = {
                    did: user.did,
                    role: data.healthUser.role,
                    pairwiseDID: data.healthUser.pairwiseDID,
                    step: 'dashboard'
                };
                localStorage.setItem('health_portal_session', JSON.stringify(session));
                setStep('dashboard');
                fetchHealthData(data.healthUser.pairwiseDID);
            } else if (data.needsRegistration) {
                setStep('role-select');
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Login failed');
        } finally {
            setLoading(false);
        }
    };

    const fetchHealthData = async (pid: string) => {
        if (!user?.did) return;
        try {
            const res = await fetch(`${API_BASE_URL}/health/role-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ globalDID: user.did, pairwiseDID: pid })
            });
            const data = await res.json();
            if (data.success) {
                setHealthData(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch data');
        }
    };

    const handleAddRecord = async () => {
        if (!pairwiseDID) return;
        try {
            const res = await fetch(`${API_BASE_URL}/health/role-record`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pairwiseDID,
                    ...newRecord,
                    isAnonymous: hideIdentity
                })
            });
            const data = await res.json();
            if (data.success) {
                setIsAddRecordOpen(false);
                fetchHealthData(pairwiseDID);
                alert('Record added successfully');
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Failed to add record');
        }
    };

    const verifyRecord = async (recordId: string, status: 'Verified' | 'Rejected') => {
        if (!pairwiseDID) return;
        try {
            const res = await fetch(`${API_BASE_URL}/health/role-verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recordId,
                    verifierDID: user?.did, // Using global DID as verifier ID
                    status
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchHealthData(pairwiseDID);
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Verification failed');
        }
    };

    const deleteRecord = async (recordId: string) => {
        if (!user?.did) return;
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/health/role-delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recordId,
                    did: user.did
                })
            });
            const data = await res.json();
            if (data.success) {
                fetchHealthData(pairwiseDID!); // Force unwrap as we are in dashboard
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Delete failed');
        }
    };

    if (!isAuthenticated || !user) return null;

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">
            <Navbar />
            <main className="pt-24 pb-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-12 text-center">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
                                <Activity className="w-8 h-8 text-gray-700" />
                            </div>
                            <h1 className="text-4xl font-semibold text-[#1d1d1f] mb-3">Praman Health Portal</h1>
                            <p className="text-gray-500">Secure, decentralized healthcare identity management</p>
                        </motion.div>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'role-select' && (
                            <motion.div key="role-select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <div className="max-w-4xl mx-auto">
                                    <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-8 text-center">Select Your Role</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                        {roles.map((role) => (
                                            <button key={role.id} onClick={() => setSelectedRole(role.id as Role)} className={`p-6 rounded-2xl border-2 transition-all text-left ${selectedRole === role.id ? 'bg-[#1d1d1f] border-[#1d1d1f] text-white' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-4">
                                                        <span className="text-3xl">{role.icon}</span>
                                                        <div>
                                                            <h3 className={`text-lg font-semibold mb-1 ${selectedRole === role.id ? 'text-white' : 'text-[#1d1d1f]'}`}>{role.name}</h3>
                                                            <p className={`text-sm ${selectedRole === role.id ? 'text-gray-300' : 'text-gray-500'}`}>{role.desc}</p>
                                                        </div>
                                                    </div>
                                                    {selectedRole === role.id && <Check className="w-6 h-6 text-white" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={handleRegister} disabled={!selectedRole || loading} className="w-full py-4 bg-[#1d1d1f] text-white rounded-xl font-semibold hover:bg-[#2d2d2f] transition-all disabled:opacity-50">
                                        {loading ? 'Processing...' : 'Continue to Portal'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'login' && (
                            <motion.div key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
                                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4"><Lock className="w-8 h-8 text-gray-700" /></div>
                                        <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2">Access Portal</h2>
                                        <p className="text-gray-500">Role: <strong>{selectedRole?.replace('_', ' ').toUpperCase()}</strong></p>
                                    </div>
                                    <button onClick={handleLogin} disabled={loading} className="w-full py-4 bg-[#1d1d1f] text-white rounded-xl font-semibold hover:bg-[#2d2d2f] transition-all flex items-center justify-center gap-2">
                                        {loading ? 'Logging in...' : <>Login <ChevronRight className="w-5 h-5" /></>}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'dashboard' && (
                            <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Dashboard Header */}
                                        <div className="bg-[#1d1d1f] rounded-2xl p-6 text-white flex justify-between items-center">
                                            <div>
                                                <p className="text-gray-400 text-sm">Welcome back</p>
                                                <h2 className="text-2xl font-semibold">{profile?.personalInfo?.firstName || 'User'}</h2>
                                                <p className="text-sm text-gray-400 mt-1 capitalize">{selectedRole?.replace('_', ' ')}</p>
                                            </div>
                                            {(selectedRole === 'citizen' || selectedRole === 'patient') && (
                                                <button onClick={() => setIsAddRecordOpen(true)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition flex items-center gap-2">
                                                    <Plus className="w-5 h-5" /> Add Record
                                                </button>
                                            )}
                                        </div>

                                        {/* Add Record Form */}
                                        {isAddRecordOpen && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white rounded-2xl border border-gray-200 p-6 overflow-hidden">
                                                <h3 className="text-lg font-semibold mb-4">Add Health Record</h3>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <select className="px-4 py-3 bg-gray-50 rounded-xl" value={newRecord.type} onChange={e => setNewRecord({ ...newRecord, type: e.target.value })}>
                                                            <option value="Status">Health Status</option>
                                                            <option value="Hospitalization">Hospitalization</option>
                                                            <option value="Insurance">Insurance</option>
                                                            <option value="Prescription">Prescription</option>
                                                        </select>
                                                        <input className="px-4 py-3 bg-gray-50 rounded-xl" placeholder="Title" value={newRecord.title} onChange={e => setNewRecord({ ...newRecord, title: e.target.value })} />
                                                    </div>
                                                    <textarea className="w-full px-4 py-3 bg-gray-50 rounded-xl" placeholder="Description/Details" rows={3} value={newRecord.description} onChange={e => setNewRecord({ ...newRecord, description: e.target.value })} />

                                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                        <div className="flex items-center gap-3">
                                                            {hideIdentity ? <EyeOff className="w-5 h-5 text-purple-600" /> : <Eye className="w-5 h-5 text-gray-500" />}
                                                            <div>
                                                                <p className="font-medium text-gray-900">Anonymous Mode</p>
                                                                <p className="text-xs text-gray-500">Hide your identity in aggregate reports</p>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => setHideIdentity(!hideIdentity)} className={`w-12 h-6 rounded-full transition-colors relative ${hideIdentity ? 'bg-purple-600' : 'bg-gray-300'}`}>
                                                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${hideIdentity ? 'translate-x-6' : ''}`} />
                                                        </button>
                                                    </div>

                                                    <div className="flex gap-4">
                                                        <button onClick={handleAddRecord} className="flex-1 py-3 bg-[#1d1d1f] text-white rounded-xl font-medium">Save Record</button>
                                                        <button onClick={() => setIsAddRecordOpen(false)} className="px-6 py-3 bg-gray-100 rounded-xl font-medium">Cancel</button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Records List */}
                                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><FileText className="w-5 h-5" /> Records</h3>
                                            {healthData?.records?.length > 0 ? (
                                                <div className="space-y-4">
                                                    {healthData.records.map((record: any) => (
                                                        <div key={record._id} className="p-5 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition-all">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-semibold text-gray-900">{record.title}</h4>
                                                                        <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600 font-medium">{record.type}</span>
                                                                        {record.isAnonymous && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs flex items-center gap-1"><EyeOff className="w-3 h-3" /> Hidden</span>}
                                                                    </div>
                                                                    <p className="text-sm text-gray-500 mt-1">{record.description}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {record.verificationStatus === 'Verified' ? (
                                                                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-medium"><CheckCircle className="w-3 h-3" /> Verified</span>
                                                                    ) : record.verificationStatus === 'Rejected' ? (
                                                                        <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-medium"><XCircle className="w-3 h-3" /> Rejected</span>
                                                                    ) : (
                                                                        <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-medium">Pending</span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                                                                <span className="text-xs text-gray-400">{new Date(record.date).toLocaleDateString()}</span>
                                                                <div className="flex gap-2">
                                                                    {selectedRole === 'doctor' && record.verificationStatus === 'Pending' && (
                                                                        <>
                                                                            <button onClick={() => verifyRecord(record._id, 'Verified')} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition">Verify</button>
                                                                            <button onClick={() => verifyRecord(record._id, 'Rejected')} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition">Reject</button>
                                                                        </>
                                                                    )}
                                                                    {(selectedRole === 'patient' || selectedRole === 'citizen') && (
                                                                        <button onClick={() => deleteRecord(record._id)} className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-10 text-gray-400">No records found.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sidebar Stats */}
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-semibold text-gray-700">Analytics</h3>
                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">Live</span>
                                            </div>
                                            <div className="space-y-4">
                                                {healthData?.stats?.verificationStats && Object.entries(healthData.stats.verificationStats).map(([key, val]: any) => (
                                                    <div key={key} className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-500 capitalize">{key}</span>
                                                        <span className="font-semibold">{val}</span>
                                                    </div>
                                                ))}
                                                <div className="pt-4 border-t border-gray-100">
                                                    <p className="text-xs text-gray-400 text-center">Government Level Access Enabled</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Family Manager Sidebar */}
                                        {(selectedRole === 'patient' || selectedRole === 'citizen') && (
                                            <FamilyManager />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
