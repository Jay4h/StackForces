import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Heart, Leaf, Building2, Menu, X } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const [isServicesOpen, setIsServicesOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);

    const isActive = (path: string) => {
        return location.pathname === path ? "text-black font-semibold" : "text-gray-500 hover:text-black transition-colors";
    };

    return (
        <>
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-full shadow-lg shadow-gray-200/20 w-[90%] max-w-[1000px]">
                <Link to="/home" className="text-2xl font-serif font-bold tracking-tight hover:opacity-80 transition-opacity flex items-center gap-2">
                    <span className="text-xl">🇮🇳</span> Praman
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8 text-[14px] font-medium font-serif">
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
                                        <Link to="/health" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors group/item">
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

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <Menu className="w-6 h-6 text-gray-700" />
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex flex-col p-6"
                    >
                        <div className="flex justify-between items-center mb-12">
                            <span className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2">
                                <span className="text-2xl">🇮🇳</span> Praman
                            </span>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-6 text-lg font-medium text-white/90">
                            {[
                                { name: 'Home', path: '/home' },
                                { name: 'Services', path: '/services', isDropdown: true },
                                { name: 'My Family', path: '/my-family' },
                                { name: 'Profile', path: '/profile' },
                                { name: 'Settings', path: '/settings' }
                            ].map((item) => (
                                <div key={item.name} className="flex flex-col">
                                    {item.isDropdown ? (
                                        <>
                                            <button
                                                onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                                                className="flex items-center justify-between hover:text-blue-400 transition-colors text-left"
                                            >
                                                {item.name}
                                                <ChevronDown className={`w-5 h-5 transition-transform ${isMobileServicesOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            <AnimatePresence>
                                                {isMobileServicesOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden pl-4 flex flex-col gap-4 mt-4"
                                                    >
                                                        {[
                                                            { name: 'Healthcare', path: '/health' },
                                                            { name: 'Agriculture', path: '/services/agriculture' },
                                                            { name: 'Smart Cities', path: '/services/smart-cities' }
                                                        ].map(sub => (
                                                            <Link
                                                                key={sub.name}
                                                                to={sub.path}
                                                                onClick={() => setIsMobileMenuOpen(false)}
                                                                className="text-base text-white/70 hover:text-white transition-colors"
                                                            >
                                                                {sub.name}
                                                            </Link>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="hover:text-blue-400 transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
