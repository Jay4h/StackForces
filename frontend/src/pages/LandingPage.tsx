import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, Zap, Lock, Globe, TrendingUp, BarChart3, PieChart, ShieldCheck, Activity } from 'lucide-react';

/**
 * Feature Card Component
 * Replicates the Framer card style with gradients, borders, and image integration.
 */
const FeatureCard = ({ title, description, imageUrl, icon: Icon }: any) => {
    return (
        <div className="group relative flex flex-col w-full h-full border border-gray-100 rounded-[24px] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F4F4F4 69.71%, #FAFAFA 100%)'
            }}>
            <div className="p-8 pb-4">
                <div className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 text-blue-600">
                    <Icon size={20} />
                </div>
                <h4 className="text-xl font-semibold text-gray-800 mb-2 leading-tight">
                    {title}
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                    {description}
                </p>
            </div>

            {/* Feature Image Area */}
            <div className="mt-auto px-4 pb-4">
                <div className="relative w-full aspect-[1.7/1] rounded-xl overflow-hidden bg-white/50 border border-gray-100">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e: any) => {
                            e.target.src = 'https://images.unsplash.com/photo-1611974715853-2b8ef9a3d136?auto=format&fit=crop&q=80&w=400';
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * LandingPage Component
 * Refined Apple-style aesthetic with "Praman" pitch content.
 * Focus: Precision, Cleanliness, "Identity as a Human Right".
 */
export default function LandingPage() {
    const navigate = useNavigate();
    const containerRef = useRef(null);



    const features = [
        {
            title: "Real-Time Verification",
            description: "Monitor your identity usage live with clear, intuitive dashboards.",
            imageUrl: "https://framerusercontent.com/images/BibMqlBbptbgvoeGSosl9D5mSw.svg",
            icon: Activity
        },
        {
            title: "Automated Reports",
            description: "Generate summaries instantly—no manual work needed.",
            imageUrl: "https://framerusercontent.com/images/UtpNRdAnmSCcUHRDJqfzTribMOA.svg",
            icon: BarChart3
        },
        {
            title: "Smart Budgeting",
            description: "Plan and adjust with AI-powered budget suggestions.",
            imageUrl: "https://framerusercontent.com/images/rYzJ6aUppe6xpzA7B5vbAbOj9g.svg",
            icon: PieChart
        },
        {
            title: "Secure Syncing",
            description: "Link accounts safely with real-time data syncing.",
            imageUrl: "https://framerusercontent.com/images/UlOABIv2wZ6Fm8g2WA1IT9BBpVU.svg",
            icon: ShieldCheck
        },
        {
            title: "Growth Score",
            description: "View key metrics and trends at a glance.",
            imageUrl: "https://framerusercontent.com/images/yWhulPS64J2n7HU4b2uWVq0ac3g.svg",
            icon: TrendingUp
        }
    ];

    return (
        <div ref={containerRef} className="min-h-[200vh] bg-[#FBFBFD] text-[#1d1d1f] font-sans selection:bg-blue-100/50">
            {/* Navbar - Glassmorphism */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 transition-all duration-300">
                <div className="text-2xl font-serif font-bold tracking-tight flex items-center gap-2">
                    <span className="text-2xl">🇮🇳</span> Praman
                </div>
                <div className="hidden md:flex items-center space-x-8 text-[14px] font-medium font-sans text-gray-500 tracking-wide">
                    <a href="#problem" className="hover:text-[#0066CC] transition-colors">The Problem</a>
                    <a href="#solution" className="hover:text-[#0066CC] transition-colors">Our Solution</a>
                    <a href="#security" className="hover:text-[#0066CC] transition-colors">Security</a>
                </div>
                <button
                    onClick={() => navigate('/enroll')}
                    className="bg-black/70 backdrop-blur-md border border-white/10 text-white px-5 py-2 rounded-full text-[13px] font-medium hover:bg-black/80 shadow-lg shadow-black/5 transition-all transform active:scale-95 font-sans"
                >
                    Get Started
                </button>
            </nav>

            {/* Hero Section */}
            <div className="relative h-screen flex flex-col items-center justify-center pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center z-10 max-w-4xl px-6"
                >
                    <h2 className="text-[#F56300] font-semibold tracking-wider uppercase text-[12px] mb-4 font-sans">
                        Introducing Praman
                    </h2>
                    <h1 className="text-6xl md:text-8xl lg:text-[90px] font-serif font-medium tracking-tight leading-[1.0] mb-6 drop-shadow-sm">
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600">
                            Identity is a human right.
                        </span>
                        <br />
                        <span className="text-gray-500 font-serif italic relative">
                            Not a corporate asset.
                            <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#F56300]/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-normal font-sans">
                        The world's first self-sovereign biometric identity system.
                        Your data never leaves your device.
                    </p>

                    <div className="mt-10 flex items-center justify-center gap-4 font-sans">
                        <button
                            onClick={() => navigate('/enroll')}
                            className="bg-[#0071e3] text-white px-8 py-3.5 rounded-full text-[15px] font-medium hover:bg-[#0077ED] transition-all hover:shadow-lg hover:shadow-blue-500/30 transform active:scale-95"
                        >
                            Create Digital ID
                        </button>
                        <a href="#how-it-works" className="text-[#0071e3] px-8 py-3.5 text-[15px] font-medium hover:underline flex items-center gap-1">
                            Learn more <span className="text-lg">›</span>
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-6 py-20 pb-32">

                {/* Header Section */}
                <header className="flex flex-col items-center text-center mb-16 space-y-6">
                    <div className="inline-flex px-4 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm text-sm font-medium text-gray-600">
                        Features
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-800 max-w-2xl mx-auto">
                        Streamline Identity with Smart Features
                    </h2>
                </header>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Top Row - 3 Cards */}
                    {features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="h-full">
                            <FeatureCard {...feature} />
                        </div>
                    ))}

                    {/* Bottom Row - 2 Centered Cards (On Desktop) */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:max-w-[66%] lg:mx-auto">
                            {features.slice(3).map((feature, index) => (
                                <div key={index + 3} className="h-full">
                                    <FeatureCard {...feature} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Accent */}
                <div className="mt-20 text-center">
                    <p className="text-gray-400 text-sm">
                        Powered by advanced biometric intelligence
                    </p>
                </div>
            </div>

            {/* The Problem Section */}
            <section id="problem" className="py-32 px-6 md:px-12 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-semibold mb-16 text-center tracking-tight">
                        The Problem with <span className="text-gray-400">Old Identity.</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-4">
                                <Lock size={24} />
                            </div>
                            <h3 className="text-xl font-semibold text-[#1d1d1f]">Centralized Honeypots</h3>
                            <p className="text-gray-500 leading-relaxed text-[15px]">
                                Traditional systems store billions of biometrics in one place. One breach exposes everyone.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-4">
                                <Globe size={24} />
                            </div>
                            <h3 className="text-xl font-semibold text-[#1d1d1f]">Privacy Loss</h3>
                            <p className="text-gray-500 leading-relaxed text-[15px]">
                                Services track you across platforms. Your digital footprint is sold without consent.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-500 mb-4">
                                <Zap size={24} />
                            </div>
                            <h3 className="text-xl font-semibold text-[#1d1d1f]">Slow Verification</h3>
                            <p className="text-gray-500 leading-relaxed text-[15px]">
                                Dependent on network speed and central server uptime. Verification takes seconds, not milliseconds.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Solution BENTO Grid */}
            <section id="solution" className="py-32 px-6 md:px-12 bg-[#F5F5F7]">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-20 text-center">
                        <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Self-Sovereign Identity.</h2>
                        <p className="text-xl text-gray-500">Three pillars of the Praman architecture.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[400px]">
                        {/* Bento Item 1: Mobile Device */}
                        <div className="col-span-1 md:col-span-2 bg-white rounded-[30px] p-10 shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden relative group hover:shadow-md transition-shadow">
                            <div className="z-10 relative">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pillar 1</h3>
                                <h4 className="text-3xl font-semibold text-[#1d1d1f] mb-4">Digital Vault</h4>
                                <p className="text-gray-500 max-w-sm">
                                    Your smartphone is your vault. Fingerprint and FaceID keys are stored effectively in the device's Secure Enclave.
                                </p>
                            </div>
                            <div className="absolute right-0 bottom-0 w-1/2 h-full bg-blue-50/50 rounded-tl-[100px] translate-y-20 translate-x-10 group-hover:translate-x-5 transition-transform">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Smartphone className="text-blue-500 w-32 h-32 opacity-80" />
                                </div>
                            </div>
                        </div>

                        {/* Bento Item 2: C++ Engine */}
                        <div className="col-span-1 bg-black text-white rounded-[30px] p-10 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                            <div className="z-10 relative">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pillar 2</h3>
                                <h4 className="text-3xl font-semibold mb-2">C++ Engine</h4>
                                <div className="text-4xl font-mono font-bold text-green-400 my-4">&lt; 100ms</div>
                                <p className="text-gray-400 text-sm">
                                    High-performance cryptographic engine capable of verifying 10k DIDs per second.
                                </p>
                            </div>
                        </div>

                        {/* Bento Item 3: Zero Knowledge */}
                        <div className="col-span-1 bg-white rounded-[30px] p-10 shadow-sm border border-gray-100 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pillar 3</h3>
                                <h4 className="text-3xl font-semibold text-[#1d1d1f] mb-4">Zero Knowledge</h4>
                                <p className="text-gray-500 text-sm">
                                    Prove you are over 18 without revealing your birthday. Verify citizenship without sharing your address.
                                </p>
                            </div>
                            <div className="mt-8 flex gap-2">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[80%]"></div>
                                </div>
                                <div className="flex-1 h-2 bg-gray-100 rounded-full"></div>
                                <div className="flex-1 h-2 bg-gray-100 rounded-full"></div>
                            </div>
                        </div>

                        {/* Bento Item 4: Comparison */}
                        <div className="col-span-1 md:col-span-2 bg-white rounded-[30px] p-10 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Aadhaar vs Praman</h3>
                            <div className="grid grid-cols-2 gap-8 z-10">
                                <div>
                                    <div className="text-lg font-semibold text-gray-400 mb-2">Traditional ID</div>
                                    <ul className="space-y-3 text-sm text-gray-400">
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div> Centralized Servers</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div> 2-3s Verification</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div> Cross-tracking possible</li>
                                    </ul>
                                </div>
                                <div className="border-l border-gray-100 pl-8">
                                    <div className="text-lg font-semibold text-[#0071e3] mb-2">Praman</div>
                                    <ul className="space-y-3 text-sm text-[#1d1d1f]">
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> On-Device Storage</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Instant Verification</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Private by default</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 px-6 md:px-12 bg-white text-center">
                <h2 className="text-4xl md:text-6xl font-semibold text-[#1d1d1f] tracking-tight mb-8">
                    Your sovereignty starts here.
                </h2>
                <button
                    onClick={() => navigate('/enroll')}
                    className="bg-[#0071e3] text-white px-10 py-5 rounded-full text-xl font-medium hover:bg-[#0077ED] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20"
                >
                    Create My Praman-ID
                </button>
            </section>
        </div >
    );
}
