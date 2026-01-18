
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Train, Zap, Wifi, Droplets, Ticket } from 'lucide-react';

export default function SmartCitiesPage() {
    return (
        <div className="min-h-screen bg-[#F0F5FF] text-[#1a1a1a] font-sans">
            <Navbar />

            <main className="pt-32 px-4 md:px-10 max-w-[1200px] mx-auto pb-10">
                <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-3xl font-bold tracking-tight text-blue-900">Smart City Portal</h1>
                        <p className="text-blue-700 mt-1">Urban Services, Transit & Utilities</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                            <Train size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Metro Transit</h3>
                        <p className="text-sm text-gray-500">Book tickets, view maps</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 mb-4 group-hover:scale-110 transition-transform">
                            <Zap size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Electricity</h3>
                        <p className="text-sm text-gray-500">Pay bills, report outages</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600 mb-4 group-hover:scale-110 transition-transform">
                            <Droplets size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Water Supply</h3>
                        <p className="text-sm text-gray-500">Bill payment, quality check</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                            <Wifi size={24} />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Public Wi-Fi</h3>
                        <p className="text-sm text-gray-500">Find hotspots, login</p>
                    </div>
                </div>

                <div className="bg-white rounded-[24px] border border-blue-100 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-blue-50">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Ticket size={20} className="text-blue-600" />
                            Active Tickets & Passes
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-6 md:w-96 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Metro Pass</div>
                                    <div className="text-2xl font-bold mt-1">Monthly</div>
                                </div>
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <Train size={20} />
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-xs text-blue-200">Valid Until</div>
                                    <div className="font-mono">28 FEB 2024</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-blue-200">Balance</div>
                                    <div className="font-bold">₹ 450.00</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
