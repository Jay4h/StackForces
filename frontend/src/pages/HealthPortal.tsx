import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    Shield,
    Lock,
    Key,
    Check,
    X,
    FileText,
    Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type MedicalRecord = {
    title: string;
    doctor: string;
    hospital: string;
    date: string;
    type: string;
};

type MedicalData = {
    bloodGroup?: string;
    allergies?: string;
    conditions?: string[];
    medications?: string[];
    insuranceProvider?: string;
    records?: MedicalRecord[];
};

export default function HealthPortal() {
    // Demo State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pairwiseDID, setPairwiseDID] = useState<string | null>(null);
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [medicalData, setMedicalData] = useState<MedicalData | null>(null);
    const [isRevoked, setIsRevoked] = useState(false);
    const [globalDID, setGlobalDID] = useState<string | null>(null);

    // Add Record Modal State
    const [showAddRecordModal, setShowAddRecordModal] = useState(false);
    const [newRecord, setNewRecord] = useState<Pick<
        MedicalRecord,
        "title" | "doctor" | "hospital"
    >>({
        title: "",
        doctor: "",
        hospital: "",
    });

    const navigate = useNavigate();

    // Determine API Base URL (same logic as webauthn-client)
    const API_BASE_URL = useMemo(() => {
        const currentHost = window.location.hostname;
        if (currentHost.includes("ngrok") || currentHost === "localhost") {
            return `http://${currentHost}:3000/api`;
        }
        return `${window.location.protocol}//${currentHost}:3000/api`;
    }, []);

    useEffect(() => {
        const storedDID = localStorage.getItem("praman_did");
        if (!storedDID) {
            alert("No Digital ID found. Please enroll first.");
            navigate("/enroll");
            return;
        }
        setGlobalDID(storedDID);
    }, [navigate]);

    const handleLogin = async () => {
        if (!globalDID) return;

        try {
            const res = await fetch(`${API_BASE_URL}/health/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ globalDID }),
            });

            const data = await res.json();

            if (data?.success) {
                setPairwiseDID(data.pairwiseDID ?? null);
                setIsAuthenticated(true);
                setIsRevoked(false);
            } else {
                alert("Login Failed: " + (data?.error ?? "Unknown error"));
            }
        } catch {
            alert("Backend Error: Ensure server is running");
        }
    };

    const handleFetchData = async () => {
        setShowConsentModal(false);
        if (!globalDID || !pairwiseDID) return;

        try {
            const res = await fetch(`${API_BASE_URL}/health/data`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    globalDID,
                    pairwiseDID,
                    requestedFields: ["bloodGroup", "allergies", "conditions", "medications"],
                }),
            });

            const data = await res.json();

            if (data?.success) {
                setMedicalData(data.data ?? {});
            } else {
                const errMsg = data?.error ?? "Unknown error";
                alert("Access Denied: " + errMsg);
                if (typeof errMsg === "string" && errMsg.includes("Revoked")) {
                    setIsRevoked(true);
                    setIsAuthenticated(false);
                }
            }
        } catch {
            alert("Backend Error");
        }
    };

    const handleRevoke = async () => {
        if (!window.confirm("Are you sure you want to revoke access? This cannot be undone."))
            return;

        if (!globalDID || !pairwiseDID) return;

        try {
            const res = await fetch(`${API_BASE_URL}/health/revoke`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ globalDID, pairwiseDID }),
            });

            const data = await res.json();

            if (data?.success) {
                alert("Access Revoked Successfully");
                setIsRevoked(true);
                setIsAuthenticated(false);
            } else {
                alert("Revoke Failed: " + (data?.error ?? "Unknown error"));
            }
        } catch {
            alert("Backend Error");
        }
    };

    const handleAddRecord = () => {
        const title = newRecord.title.trim();
        const doctor = newRecord.doctor.trim();
        const hospital = newRecord.hospital.trim();

        if (!title || !doctor || !hospital) {
            alert("Please fill Title, Doctor, and Hospital.");
            return;
        }

        const record: MedicalRecord = {
            title,
            doctor,
            hospital,
            date: new Date().toISOString().slice(0, 10),
            type: "Manual",
        };

        // Client-side add (safe even if backend does not support adding records yet)
        setMedicalData((prev) => {
            const next: MedicalData = { ...(prev ?? {}) };
            next.records = Array.isArray(next.records) ? [record, ...next.records] : [record];
            return next;
        });

        setShowAddRecordModal(false);
        setNewRecord({ title: "", doctor: "", hospital: "" });
    };

    if (isRevoked) {
        return (
            <div className="min-h-screen bg-red-50 flex items-center justify-center p-6 text-center">
                <div>
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <X size={40} className="text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-red-900 mb-2">Access Revoked</h1>
                    <p className="text-red-700 max-w-md mx-auto">
                        Your decentralized identity has blocked this portal from accessing your
                        data. The Pairwise DID has been blacklisted.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                    >
                        Reset Portal
                    </button>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] text-[#1a1a1a] font-sans">
                <Navbar />
                <main className="pt-32 px-4 flex flex-col items-center justify-center min-h-[80vh] text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600">
                            <Activity size={40} />
                        </div>
                        <h1 className="text-4xl font-serif font-bold mb-4">Praman Health Portal</h1>
                        <p className="text-gray-500 max-w-lg mx-auto mb-8">
                            A secure, federated health interface. We use a Pairwise DID specific to
                            this portal, ensuring your Master Identity is never exposed.
                        </p>

                        <button
                            onClick={handleLogin}
                            className="group relative px-8 py-3 bg-black text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
                        >
                            <span className="flex items-center gap-2">
                                <Key size={18} /> Login with Bharat-ID
                            </span>
                            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 opacity-30 blur-lg group-hover:opacity-60 transition duration-200" />
                        </button>

                        <div className="mt-8 flex gap-8 justify-center text-xs text-gray-400 font-mono">
                            <div className="flex items-center gap-1">
                                <Shield size={12} /> NO CENTRAL DB
                            </div>
                            <div className="flex items-center gap-1">
                                <Lock size={12} /> E2E ENCRYPTED
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-[#1a1a1a] font-sans">
            <Navbar />

            {/* Consent Modal */}
            <AnimatePresence>
                {showConsentModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.98, y: 8, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-green-500" />

                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Shield size={20} className="text-blue-600" />
                                    Consent Request
                                </h3>
                                <button onClick={() => setShowConsentModal(false)}>
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <p className="text-gray-600 mb-6 text-sm">
                                <strong>Health Portal</strong> is requesting access to the following
                                granular data fields. Unchecked fields will remain masked.
                            </p>

                            <div className="space-y-3 mb-8">
                                {["Blood Group", "Allergies", "Chronic Conditions", "Medications"].map(
                                    (f) => (
                                        <div
                                            key={f}
                                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                                        >
                                            <div className="mt-1">
                                                <Check size={14} className="text-green-600" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-800">{f}</span>
                                        </div>
                                    )
                                )}
                            </div>

                            <button
                                onClick={handleFetchData}
                                className="w-full py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                            >
                                <span className="text-xl">☝️</span> Touch ID to Approve
                            </button>

                            <p className="text-center text-[10px] text-gray-400 mt-4">
                                Secured by FIDO2 WebAuthn
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Record Modal */}
            <AnimatePresence>
                {showAddRecordModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.92, y: 18 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.98, y: 8, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden"
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-xl font-bold">Add Medical Record</h3>
                                <button onClick={() => setShowAddRecordModal(false)}>
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Blood Test Report"
                                        value={newRecord.title}
                                        onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Doctor
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Dr. Name"
                                        value={newRecord.doctor}
                                        onChange={(e) => setNewRecord({ ...newRecord, doctor: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hospital
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Hospital Name"
                                        value={newRecord.hospital}
                                        onChange={(e) =>
                                            setNewRecord({ ...newRecord, hospital: e.target.value })
                                        }
                                    />
                                </div>

                                <button
                                    onClick={handleAddRecord}
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                                >
                                    Save Record
                                </button>

                                <button
                                    onClick={() => setShowAddRecordModal(false)}
                                    className="w-full py-3 text-gray-500 font-medium hover:text-black transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="pt-28 px-4 md:px-10 max-w-[1200px] mx-auto pb-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-3xl font-bold tracking-tight">My Health Dashboard</h1>
                        <p className="flex items-center gap-2 text-xs font-mono text-gray-500 mt-1 bg-gray-100 px-2 py-1 rounded w-fit">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            PAIRWISE ID: {pairwiseDID ?? "—"}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3"
                    >
                        <button
                            onClick={() => setShowAddRecordModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#4D89FF] text-white rounded-xl hover:bg-[#3b76e6] transition-colors shadow-lg shadow-blue-200 text-sm font-medium"
                            disabled={!medicalData}
                            title={!medicalData ? "Decrypt data to add records" : "Add a record"}
                        >
                            <Plus size={18} />
                            <span>Add Record</span>
                        </button>

                        <button
                            onClick={handleRevoke}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-colors shadow-sm text-sm font-medium"
                        >
                            <X size={18} />
                            <span>Revoke Access</span>
                        </button>
                    </motion.div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Vital Stats */}
                        {!medicalData ? (
                            <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm text-center">
                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lock size={32} />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Medical Records are Locked</h3>
                                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                    You have authenticated, but your medical data is encrypted. Provide
                                    biometric consent to decrypt specific fields.
                                </p>
                                <button
                                    onClick={() => setShowConsentModal(true)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                                >
                                    Decrypt My Data
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                            >
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="text-sm text-gray-400 mb-1">Blood Group</div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {medicalData.bloodGroup ?? "—"}
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="text-sm text-gray-400 mb-1">Allergies</div>
                                    <div className="text-xl font-bold text-red-500">
                                        {medicalData.allergies ?? "—"}
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="text-sm text-gray-400 mb-1">Conditions</div>
                                    <div className="text-lg font-bold text-orange-600">
                                        {Array.isArray(medicalData.conditions) && medicalData.conditions.length > 0
                                            ? medicalData.conditions[0]
                                            : "—"}
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="text-sm text-gray-400 mb-1">Insurance</div>
                                    <div className="text-sm font-bold text-green-700">
                                        {medicalData.insuranceProvider ?? "—"}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Records */}
                        {!medicalData ? (
                            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden opacity-50 pointer-events-none filter blur-[1px]">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="font-bold">Recent History (Encrypted)</h3>
                                </div>
                                <div className="p-8 text-center text-sm text-gray-400">
                                    Unlock data to view timeline
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <FileText size={20} className="text-gray-400" />
                                        Medical Records
                                    </h3>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                        Decrypted
                                    </span>
                                </div>

                                <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                                    {Array.isArray(medicalData.records) && medicalData.records.length > 0 ? (
                                        medicalData.records.map((record, i) => (
                                            <div
                                                key={`${record.title}-${record.date}-${i}`}
                                                className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{record.title}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {record.hospital} • {record.doctor}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-gray-900">{record.date}</div>
                                                    <div className="text-xs text-gray-400">{record.type}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-400 text-sm">
                                            No records found. Add one!
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - ABHA Card */}
                    <div className="space-y-6">
                        <motion.div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                            <div className="flex items-start justify-between mb-8 relative z-10">
                                <div className="flex items-center gap-2">
                                    <Shield className="text-orange-400" size={24} />
                                    <span className="font-medium opacity-90">ABHA Health ID</span>
                                </div>
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                                    alt="Emblem"
                                    className="w-8 opacity-50 invert"
                                />
                            </div>

                            <div className="relative z-10">
                                <div className="text-2xl font-mono tracking-wider mb-2">
                                    {pairwiseDID ? `${pairwiseDID.substring(15, 30)}...` : "XX-XX-XX-X..."}
                                </div>
                                <div className="text-sm opacity-60 font-mono">AUTHORIZED USER</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
