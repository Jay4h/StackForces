
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { CloudRain, Tractor, Sprout, FileCheck } from 'lucide-react';

export default function AgriculturePage() {
    const schemes = [
        { title: "PM KISAN", amount: "₹6,000/yr", status: "Active", nextDue: "Feb 2024" },
        { title: "Soil Health Card", status: "Updated", date: "Jan 10, 2024" },
        { title: "Crop Insurance", coverage: "Rabi 2023-24", status: "Active" },
    ];

    return (
        <div className="min-h-screen bg-[#F0FDF4] text-[#1a1a1a] font-sans">
            <Navbar />

            <main className="pt-32 px-4 md:px-10 max-w-[1200px] mx-auto pb-10">
                <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-3xl font-bold tracking-tight text-green-900">Agriculture Portal</h1>
                        <p className="text-green-700 mt-1">Farmer Resources & Subsidy Management</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-green-600 font-medium">Land Holdings</div>
                            <div className="text-2xl font-bold text-gray-900">2.5 Hectares</div>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                            <Tractor size={24} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-green-600 font-medium">Coming Harvest</div>
                            <div className="text-2xl font-bold text-gray-900">Wheat (Rabi)</div>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                            <Sprout size={24} />
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex items-center justify-between">
                        <div>
                            <div className="text-sm text-green-600 font-medium">Weather Alert</div>
                            <div className="text-2xl font-bold text-gray-900">Light Rain</div>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                            <CloudRain size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-green-100 p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <FileCheck size={20} className="text-green-600" />
                        Active Schemes & Subsidies
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {schemes.map((scheme, i) => (
                            <div key={i} className="p-4 rounded-xl border border-green-100 bg-green-50/30 hover:bg-green-50 transition-colors">
                                <div className="font-bold text-green-900">{scheme.title}</div>
                                <div className="text-sm text-green-700 mt-1">
                                    {scheme.amount && <span className="block">Benefit: {scheme.amount}</span>}
                                    {scheme.status && <span className="inline-block px-2 py-0.5 rounded-full bg-green-200 text-green-800 text-xs font-semibold mt-2">{scheme.status}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
