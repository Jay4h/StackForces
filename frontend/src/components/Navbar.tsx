import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Heart, Leaf, Building2 } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const [isServicesOpen, setIsServicesOpen] = useState(false);

    const isActive = (path: string) => {
        return location.pathname === path ? "text-black font-semibold" : "text-gray-500 hover:text-black transition-colors";
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-5 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
            <Link to="/home" className="text-2xl font-serif font-bold tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2">
                <span className="text-xl">🇮🇳</span> Praman
            </Link>
            <div className="flex items-center space-x-8 text-[14px] font-medium font-sans">
                <Link to="/home" className={isActive('/home')}>Home</Link>

                {/* Services Dropdown */}
                <div
                    className="relative group"
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                >
                    <button className={`flex items-center gap-1 ${isActive('/services')} group-hover:text-black`}>
                        Services <ChevronDown size={14} className={`transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isServicesOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[280px] bg-white rounded-2xl shadow-xl border border-gray-100 p-2 overflow-hidden"
                            >
                                <div className="py-1">
                                    <Link to="/services?type=healthcare" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors group/item">
                                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                            <Heart size={16} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">HealthCare</div>
                                            <div className="text-[11px] text-gray-500">Medical records & access</div>
                                        </div>
                                    </Link>
                                    <Link to="/services?type=agriculture" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors group/item">
                                        <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                            <Leaf size={16} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">Agriculture</div>
                                            <div className="text-[11px] text-gray-500">Subsidies & land rights</div>
                                        </div>
                                    </Link>
                                    <Link to="/services?type=smartcities" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors group/item">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                            <Building2 size={16} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-gray-900">Smart Cities</div>
                                            <div className="text-[11px] text-gray-500">Transit & utilities</div>
                                        </div>
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <Link to="/how-it-works" className={isActive('/how-it-works')}>How it Works</Link>
                <Link to="/my-family" className={isActive('/my-family')}>My Family</Link>
                <Link to="/profile" className={isActive('/profile')}>Profile</Link>
                <Link to="/settings" className={isActive('/settings')}>Settings</Link>
            </div>
        </nav>
    );
};

export default Navbar;
