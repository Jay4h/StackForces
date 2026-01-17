import React from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Bell, Shield, Eye, Moon, Monitor, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
    const settings = [
        {
            section: "Account", items: [
                { icon: Shield, label: "Security & Login", value: "Enabled" },
                { icon: Eye, label: "Privacy Settings", value: "Standard" }
            ]
        },
        {
            section: "Preferences", items: [
                { icon: Bell, label: "Notifications", value: "On" },
                { icon: Moon, label: "Appearance", value: "Light Mode" },
                { icon: Monitor, label: "Linked Devices", value: "2 Active" }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white text-[#1a1a1a] font-sans">
            <Navbar />

            <main className="pt-32 px-10 max-w-[800px] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>

                    <div className="space-y-8">
                        {settings.map((group, groupIndex) => (
                            <div key={groupIndex}>
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-2">{group.section}</h2>
                                <div className="bg-white rounded-[24px] border border-gray-200 overflow-hidden">
                                    {group.items.map((item, itemIndex) => (
                                        <div
                                            key={itemIndex}
                                            className={`flex items-center justify-between p-5 hover:bg-gray-50 cursor-pointer transition-colors ${itemIndex !== group.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="text-gray-500">
                                                    <item.icon size={20} />
                                                </div>
                                                <span className="font-medium text-[15px]">{item.label}</span>
                                            </div>
                                            <div className="flex items-center space-x-3 text-gray-400">
                                                <span className="text-sm font-medium">{item.value}</span>
                                                <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center text-sm text-gray-400">
                        <p>Version 1.0.0 • Praman</p>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
