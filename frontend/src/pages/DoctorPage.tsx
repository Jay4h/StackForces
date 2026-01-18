import { useState } from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Stethoscope, User, FileText, Upload, CheckCircle } from 'lucide-react';

export default function DoctorPage() {
    const [patientDID, setPatientDID] = useState("did:praman:7x928374haskjdh2384");
    const [record, setRecord] = useState({
        title: '',
        type: 'Lab Report',
        diagnosis: '',
        prescription: ''
    });
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/health/record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    globalDID: patientDID, // The User's ID
                    pairwiseDID: "did:bharat:hospital:apollo_delhi", // Identify the uploader
                    type: record.type,
                    title: record.title,
                    doctor: "Dr. Rajesh Koothrappali",
                    hospital: "Apollo Hospital, Delhi",
                    date: new Date().toLocaleDateString(),
                    description: record.diagnosis,
                    data: { prescription: record.prescription }
                })
            });

            const data = await res.json();
            if (data.success) {
                setStatus('success');
                setTimeout(() => {
                    setStatus('idle');
                    setRecord({ title: '', type: 'Lab Report', diagnosis: '', prescription: '' });
                }, 3000);
            } else {
                alert("Upload failed: " + data.error);
            }
        } catch (err) {
            alert("Network Error");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <Navbar />

            <main className="pt-28 px-4 max-w-2xl mx-auto pb-20">
                <div className="text-center mb-10">
                    <div className="inline-flex justify-center items-center w-20 h-20 bg-blue-100 rounded-full text-blue-600 mb-4">
                        <Stethoscope size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Doctor's Desk</h1>
                    <p className="text-slate-500">Securely upload patient records to the Bharat-ID Ledger</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
                >
                    <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                        <div className="font-medium flex items-center gap-2">
                            <Upload size={20} /> Upload Record
                        </div>
                        <div className="text-xs bg-blue-500 px-3 py-1 rounded-full border border-blue-400">
                            Dr. Rajesh K.
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {status === 'success' ? (
                            <div className="text-center py-10">
                                <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-green-700">Record Uploaded!</h3>
                                <p className="text-gray-500">The patient can now see this in their Health Portal.</p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                                        <User size={16} /> Patient DID
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={patientDID}
                                        onChange={e => setPatientDID(e.target.value)}
                                        placeholder="did:bharat:..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Record Title</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="e.g. MRI Scan"
                                            value={record.title}
                                            onChange={e => setRecord({ ...record, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Type</label>
                                        <select
                                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                            value={record.type}
                                            onChange={e => setRecord({ ...record, type: e.target.value })}
                                        >
                                            <option>Lab Report</option>
                                            <option>Prescription</option>
                                            <option>Vaccination</option>
                                            <option>Surgery Note</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-2 block flex items-center gap-2">
                                        <FileText size={16} /> Clinical Notes
                                    </label>
                                    <textarea
                                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                                        placeholder="Diagnosis details..."
                                        value={record.diagnosis}
                                        onChange={e => setRecord({ ...record, diagnosis: e.target.value })}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
                                >
                                    Push to Blockchain
                                </button>
                            </>
                        )}
                    </form>
                </motion.div>

                <p className="text-center text-xs text-slate-400 mt-8">
                    Strictly for authorized medical personnel only.<br />
                    Access is logged and audited.
                </p>
            </main>
        </div>
    );
}
