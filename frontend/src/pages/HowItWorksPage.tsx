import React from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

export default function HowItWorksPage() {
    const steps = [
        { id: "01", title: "Biometric Enrollment", desc: "Scan your Face or Fingerprint. Your keys are generated locally on your device." },
        { id: "02", title: "Zero-Knowledge Verifications", desc: "Prove you are you, without revealing personal details like DOB or Address." },
        { id: "03", title: "Family Management", desc: "Add family members and manage their digital identities securely." },
        { id: "04", title: "Government Integration", desc: "Seamlessly access AIIMS, Kisan Credit, and Municipal services." }
    ];

    return (
        <div className="min-h-screen bg-white text-[#1a1a1a] font-sans">
            <Navbar />

            <main className="pt-32 px-10 max-w-[1000px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-center mb-20">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">How It Works</h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Getting started with Praman is simple, secure, and private. Here's how you claim your sovereignty.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.15 }}
                                className="flex items-center p-6 rounded-[24px] border border-gray-100 hover:border-gray-200 bg-white transition-colors"
                            >
                                <div className="text-4xl font-bold text-gray-100 mr-8 font-mono">{step.id}</div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                    <p className="text-gray-500 text-sm font-medium">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
