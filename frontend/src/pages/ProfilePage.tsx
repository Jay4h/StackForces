import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, CheckCircle, Shield, CreditCard, Eye, EyeOff, AlertCircle, Save, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function ProfilePage() {
    const [showDid, setShowDid] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // User Form State
    const [formData, setFormData] = useState({
        name: "Cristiano Mario Dandy",
        email: "cristiano.mario@example.com",
        phone: "+91 98765 43210",
        address: "123, Tech Park Road, Bangalore, India",
        dob: "1995-08-15"
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [did] = useState("did:praman:7x928374haskjdh2384");

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = "Full Name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
        if (!formData.address.trim()) newErrors.address = "Address is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm()) {
            setIsEditing(false);
            // Simulate API call
            console.log("Saving data:", formData);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error when user types
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: "" });
        }
    };

    const maskedDid = `${did.substring(0, 4)} **** **** ${did.substring(did.length - 4)}`;

    return (
        <div className="min-h-screen bg-[#FBFBFD] text-[#1d1d1f] font-sans">
            <Navbar />

            <main className="pt-32 px-6 md:px-10 max-w-[1200px] mx-auto pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <header className="mb-8 flex items-end justify-between">
                        <div>
                            <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">My Profile</h1>
                            <p className="text-gray-500">Manage your personal information and digital identity.</p>
                        </div>
                    </header>

                    {/* Bento Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

                        {/* 1. Digital ID Card (PREMIUM DARK MATTE REDESIGN) */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1">
                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 h-full flex flex-col justify-between group hover:shadow-md transition-shadow">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <CreditCard size={16} /> Digital Identity
                                </h3>

                                {/* The Card Component - PREMIUM DARK MATTE */}
                                <div className="aspect-[1.586/1] w-full max-w-[400px] mx-auto rounded-[20px] relative overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-[1.02] group/card bg-[#2C333F] text-white">

                                    {/* 1. Background Pattern (World Map Dots Effect) */}
                                    {/* 1. Background Pattern (World Map Image) */}
                                    <div className="absolute inset-0 opacity-40 mix-blend-soft-light" style={{
                                        backgroundImage: 'url(/assets/world-map.png)',
                                        backgroundSize: '110%',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat'
                                    }}></div>

                                    {/* 2. Glass Sheen / Reflection */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-30 pointer-events-none"></div>

                                    {/* Content Layer */}
                                    <div className="relative z-10 h-full flex flex-col justify-between p-7 text-white font-sans">
                                        <div className="flex justify-between items-start">
                                            {/* Chip - Outline Style as per image */}
                                            <div className="w-12 h-10 rounded-lg border border-gray-400/50 flex flex-col items-center justify-center relative bg-white/5 backdrop-blur-sm">
                                                <div className="w-full h-[1px] bg-gray-400/30 absolute top-1/3"></div>
                                                <div className="w-full h-[1px] bg-gray-400/30 absolute bottom-1/3"></div>
                                                <div className="h-full w-[1px] bg-gray-400/30 absolute left-1/3"></div>
                                                <div className="h-full w-[1px] bg-gray-400/30 absolute right-1/3"></div>
                                                <div className="w-4 h-3 rounded border border-gray-400/40"></div>
                                            </div>

                                            {/* Contactless Icon */}
                                            <div className="opacity-90 rotate-90 scale-90">
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                                                    <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                                                    <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                                                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="space-y-6 mt-4">
                                            {/* ID Number - Central & Large */}
                                            <div className="font-sans text-3xl tracking-widest flex items-center gap-3 font-normal text-white drop-shadow-md">
                                                <span>{did.substring(did.length - 4)}</span>
                                                <span className="text-2xl tracking-wide opacity-80">1122</span>
                                                <span className="text-2xl tracking-wide opacity-80">4595</span>
                                                <span className="text-2xl tracking-wide opacity-80">7852</span>
                                            </div>

                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <div className="font-normal text-lg tracking-wide mb-3 text-gray-200">{formData.name || "YOUR NAME"}</div>

                                                    <div className="flex gap-8 text-[10px] text-gray-400 uppercase tracking-wider">
                                                        <div>
                                                            <div className="mb-0.5">Expiry Date</div>
                                                            <div className="text-sm text-gray-200 font-medium">12/30</div>
                                                        </div>
                                                        <div>
                                                            <div className="mb-0.5">CVV</div>
                                                            <div className="text-sm text-gray-200 font-medium">698</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Brand Logo - Bottom Right */}
                                                <div className="text-xl font-normal tracking-wide text-gray-300">
                                                    Praman
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-3 text-sm">
                                    <button
                                        onClick={() => setShowDid(!showDid)}
                                        className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium text-gray-600 border border-gray-100"
                                    >
                                        {showDid ? <EyeOff size={14} /> : <Eye size={14} />} {showDid ? "Hide" : "Show"}
                                    </button>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(did)}
                                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 border border-gray-100"
                                        title="Copy ID"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 2. User Details Form */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <User size={18} /> Personal Details
                                    </h3>
                                    <button
                                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isEditing
                                            ? "bg-black text-white hover:bg-gray-800"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {isEditing ? "Save Changes" : "Edit Profile"}
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Name Input */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 bg-gray-50 rounded-xl border ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-100'} focus:outline-none focus:border-blue-500 transition-all`}
                                                    placeholder="Enter your full name"
                                                />
                                                {errors.name && (
                                                    <div className="absolute right-3 top-3 text-red-500 animate-pulse">
                                                        <AlertCircle size={18} />
                                                    </div>
                                                )}
                                                {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-gray-50/50 rounded-xl border border-transparent font-medium border-dashed border-gray-200">
                                                {formData.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Email Input */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 bg-gray-50 rounded-xl border ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-100'} focus:outline-none focus:border-blue-500 transition-all`}
                                                    placeholder="name@example.com"
                                                />
                                                {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-gray-50/50 rounded-xl border border-transparent font-medium border-dashed border-gray-200 flex items-center gap-2">
                                                <Mail size={14} className="opacity-50" /> {formData.email}
                                            </div>
                                        )}
                                    </div>

                                    {/* Phone & DOB Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone</label>
                                            {isEditing ? (
                                                <div>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        className={`w-full p-3 bg-gray-50 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 transition-all`}
                                                    />
                                                    {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>}
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-gray-50/50 rounded-xl border border-transparent font-medium border-dashed border-gray-200 flex items-center gap-2">
                                                    <Phone size={14} className="opacity-50" /> {formData.phone}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Date of Birth</label>
                                            {isEditing ? (
                                                <input
                                                    type="date"
                                                    name="dob"
                                                    value={formData.dob}
                                                    onChange={handleChange}
                                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 transition-all"
                                                />
                                            ) : (
                                                <div className="p-3 bg-gray-50/50 rounded-xl border border-transparent font-medium border-dashed border-gray-200 flex items-center gap-2">
                                                    <Calendar size={14} className="opacity-50" /> {formData.dob}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Address Input */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Address</label>
                                        {isEditing ? (
                                            <div>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    className={`w-full p-3 bg-gray-50 rounded-xl border ${errors.address ? 'border-red-500' : 'border-gray-200'} focus:outline-none focus:border-blue-500 transition-all`}
                                                />
                                                {errors.address && <p className="text-red-500 text-xs mt-1 ml-1">{errors.address}</p>}
                                            </div>
                                        ) : (
                                            <div className="p-3 bg-gray-50/50 rounded-xl border border-transparent font-medium border-dashed border-gray-200 flex items-center gap-2">
                                                <MapPin size={14} className="opacity-50" /> {formData.address}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Account Status (Visual Bento Item) */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-2">
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[24px] shadow-sm p-6 text-white h-full flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-x-10 -translate-y-10"></div>

                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">Status</h3>
                                        <p className="text-white/60 text-sm">Citizen Verification</p>
                                    </div>
                                    <div className="px-3 py-1 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full text-xs font-medium flex items-center gap-1">
                                        <CheckCircle size={12} /> Verified
                                    </div>
                                </div>

                                <div className="space-y-3 relative z-10 mt-6">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-white/50">KYC Level</span>
                                        <span className="font-semibold">Level 3 (Biometric)</span>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-sky-400 h-full w-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </main>
        </div>
    );
}
