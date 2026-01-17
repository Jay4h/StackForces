import React from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Shield, CreditCard, Users, FileText, Activity, Lock } from 'lucide-react';

export default function ServicesPage() {
    const services = [
        { icon: Shield, title: "Identity Protection", desc: "Advanced biometric security for your digital identity." },
        { icon: CreditCard, title: "Smart Payments", desc: "Digital Rupee & Unified Payments Interface (UPI) integration." },
        { icon: Users, title: "Family Management", desc: "Manage accounts and permissions for your whole family." },
        { icon: FileText, title: "Document Vault", desc: "Securely store Land Records, Degrees, and Legal Deeds." },
        { icon: Activity, title: "Health Records", desc: "Unified Health Interface (UHI) - AIIMS & Hospital records." },
        { icon: Lock, title: "Privacy Controls", desc: "Granular control over who accesses your personal data." }
    ];

    return (
        <div className="min-h-screen bg-white text-[#1a1a1a] font-sans">
            <Navbar />

            <main className="pt-32 px-10 max-w-[1200px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold tracking-tight mb-4">Our Services</h1>
                        <p className="text-gray-500 text-lg max-w-2xl">
                            Comprehensive tools designed to secure, manage, and enhance your digital life.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-8 rounded-[28px] border border-gray-100 bg-white hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all cursor-pointer group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#4D89FF] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <service.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                                <p className="text-gray-500 leading-relaxed text-sm">
                                    {service.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
