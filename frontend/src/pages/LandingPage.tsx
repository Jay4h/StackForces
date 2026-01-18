import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Lock, Globe, TrendingUp, BarChart3, PieChart, ShieldCheck, Activity, Menu, X, Plus } from 'lucide-react';

/**
 * FAQ Item Component
 * Expanding accordion item with smooth animation and clean design.
 */
const FAQItem = ({ question, answer, isOpen, onClick }: any) => {
    return (
        <div className="mb-4 rounded-[20px] bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors overflow-hidden">
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between p-6 text-left"
            >
                <span className="text-lg font-medium text-gray-900 pr-8">{question}</span>
                <span className={`flex-shrink-0 p-2 rounded-full bg-white shadow-sm border border-gray-100 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                    <Plus className="w-5 h-5 text-gray-400" />
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <div className="px-6 pb-6 text-gray-500 leading-relaxed">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const faqs = [
        {
            question: "How long does setup take?",
            answer: "Setting up your Praman-ID takes less than 2 minutes. Simply scan your biometrics, and your secure digital vault is created instantly on your device."
        },
        {
            question: "Is my personal data secure?",
            answer: "Absolutely. Praman uses a decentralized architecture where your biometric data is encrypted and stored only on your device's Secure Enclave. It never touches our servers."
        },
        {
            question: "Who can verify my ID?",
            answer: "Only authorized service providers you explicitly approve can verify your ID. You share only what's necessary (e.g., 'Over 18') using Zero-Knowledge Proofs."
        },
        {
            question: "Can I revoke my ID?",
            answer: "Yes, you have full control. You can revoke access to specific services or delete your ID entirely from your device at any time."
        },
        {
            question: "What if I lose my device?",
            answer: "Since your ID is bound to your hardware, you simply enroll again on your new device. Your old ID becomes invalid without your biometric authentication."
        }
    ];



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
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-xl border border-gray-300 rounded-full shadow-lg shadow-gray-200/20 w-[90%] max-w-[1000px] transition-all duration-300">
                <div className="text-2xl font-serif font-bold tracking-tight flex items-center gap-2">
                    <span className="text-2xl">🇮🇳</span> Praman
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center space-x-8 text-[14px] font-medium font-sans text-gray-500 tracking-wide">
                    <a href="#problem" className="hover:text-[#0066CC] transition-colors">The Problem</a>
                    <a href="#solution" className="hover:text-[#0066CC] transition-colors">Our Solution</a>
                    <a href="#security" className="hover:text-[#0066CC] transition-colors">Security</a>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/enroll')}
                        className="hidden md:block bg-black/70 backdrop-blur-md border border-white/10 text-white px-5 py-2 rounded-full text-[13px] font-medium hover:bg-black/80 shadow-lg shadow-black/5 transition-all transform active:scale-95 font-sans"
                    >
                        Get Started
                    </button>

                    {/* Hamburger Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <Menu className="w-6 h-6 text-gray-700" />
                    </button>
                </div>
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
                            {['Features', 'Pricing', 'FAQ', 'Contact', 'Blog'].map((item) => (
                                <a
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            <div className="relative h-screen flex flex-col items-center justify-center pt-20">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.2,
                                delayChildren: 0.1
                            }
                        }
                    }}
                    className="text-center z-10 max-w-4xl px-6"
                >
                    <motion.h2
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                        }}
                        className="text-[#F56300] font-semibold tracking-wider uppercase text-[12px] mb-4 font-sans"
                    >
                        Introducing Praman
                    </motion.h2>
                    <motion.h1
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                        }}
                        className="text-6xl md:text-8xl lg:text-[90px] font-serif font-medium tracking-tight leading-[1.0] mb-6 drop-shadow-sm"
                    >
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
                    </motion.h1>
                    <motion.p
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                        }}
                        className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-normal font-sans"
                    >
                        The world's first self-sovereign biometric identity system.
                        Your data never leaves your device.
                    </motion.p>

                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.4 } }
                        }}
                        className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 font-sans"
                    >
                        <button
                            onClick={() => navigate('/enroll')}
                            className="bg-[#000000] text-white px-8 py-3.5 rounded-full text-[15px] font-medium hover:bg-blue-600 transition-colors shadow-md transform active:scale-95"
                        >
                            Create Digital ID
                        </button>
                        <button
                            onClick={() => navigate('/microservices')}
                            className="bg-[#000000] text-white px-8 py-3.5 rounded-full text-[15px] font-medium hover:bg-blue-600 transition-colors shadow-md transform active:scale-95"
                        >
                            🔧 View Microservices
                        </button>
                        <a href="#how-it-works" className="text-[#659BFF] px-8 py-3.5 text-[15px] font-medium hover:underline flex items-center gap-1">
                            Learn more <span className="text-lg">›</span>
                        </a>
                    </motion.div>
                </motion.div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-6 py-20 pb-32">

                {/* Header Section */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center text-center mb-16 space-y-6"
                >
                    <div className="inline-flex px-4 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm text-sm font-medium text-gray-600">
                        Features
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-800 max-w-2xl mx-auto">
                        Streamline Identity with Smart Features
                    </h2>
                </motion.header>

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
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="text-4xl md:text-5xl font-semibold mb-16 text-center tracking-tight"
                    >
                        The Problem with <span className="text-gray-400">Old Identity.</span>
                    </motion.h2>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-12"
                    >
                        {/* Lock - Centralized Honeypots */}
                        <div className="space-y-4">
                            <div className="w-14 h-14 bg-[#FFEEEE] rounded-[20px] flex items-center justify-center text-[#FF3B30] mb-4 shadow-sm border border-[#FFE5E5]">
                                <Lock size={26} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-semibold text-[#1d1d1f]">Centralized Honeypots</h3>
                            <p className="text-gray-500 leading-relaxed text-[15px]">
                                Traditional systems store billions of biometrics in one place. One breach exposes everyone.
                            </p>
                        </div>

                        {/* Globe - Privacy Loss */}
                        <div className="space-y-4">
                            <div className="w-14 h-14 bg-[#FFF4E5] rounded-[20px] flex items-center justify-center text-[#FF9500] mb-4 shadow-sm border border-[#FFEACC]">
                                <Globe size={26} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-semibold text-[#1d1d1f]">Privacy Loss</h3>
                            <p className="text-gray-500 leading-relaxed text-[15px]">
                                Services track you across platforms. Your digital footprint is sold without consent.
                            </p>
                        </div>

                        {/* Zap - Slow Verification */}
                        <div className="space-y-4">
                            <div className="w-14 h-14 bg-[#EAF4FF] rounded-[20px] flex items-center justify-center text-[#007AFF] mb-4 shadow-sm border border-[#E0EFFF]">
                                <Zap size={26} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-semibold text-[#1d1d1f]">Slow Verification</h3>
                            <p className="text-gray-500 leading-relaxed text-[15px]">
                                Dependent on network speed and central server uptime. Verification takes seconds, not milliseconds.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* The Solution BENTO Grid */}
            <section id="solution" className="py-32 px-6 md:px-12 bg-[#FFFFFF]">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-20 text-center"
                    >
                        <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] tracking-tight mb-4">Self-Sovereign Identity.</h2>
                        <p className="text-xl text-gray-500">Three pillars of the Praman architecture.</p>
                    </motion.div>

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
                            <div className="absolute right-[-40px] top-[60px] md:right-[-60px] md:top-[80px] transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
                                <div className="relative w-[260px] md:w-[300px] aspect-[0.463/1] bg-white rounded-[2.5rem] overflow-hidden">
                                    <img
                                        src="https://framerusercontent.com/images/8EqJJl7WcpFsqJnET6imexN7M0.png"
                                        alt="Praman App Interface"
                                        className="w-full h-full object-cover"
                                    />
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
            </section >

            {/* FAQ Section */}
            <section id="faq" className="py-32 px-6 md:px-12 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24">
                    {/* Left Side */}
                    <div className="lg:w-1/3 space-y-6">
                        <div className="inline-flex px-4 py-1.5 rounded-full border border-gray-200 bg-white shadow-sm text-sm font-medium text-gray-600">
                            FAQ
                        </div>
                        <h2 className="text-4xl md:text-5xl font-semibold text-[#1d1d1f] tracking-tight">
                            All You Need to Know
                        </h2>
                        <p className="text-gray-500 text-lg leading-relaxed">
                            Everything you need to know about the product and billing. Can’t find the answer you’re looking for? Please chat to our friendly team.
                        </p>
                    </div>

                    {/* Right Side - Accordion */}
                    <div className="lg:w-2/3">
                        {faqs.map((faq, index) => (
                            <FAQItem
                                key={index}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={index === openFaqIndex}
                                onClick={() => setOpenFaqIndex(index === openFaqIndex ? null : index)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            < section className="py-32 px-6 md:px-12 bg-white text-center" >
                <h2 className="text-4xl md:text-6xl font-semibold text-[#1d1d1f] tracking-tight mb-8">
                    Your sovereignty starts here.
                </h2>
                <button
                    onClick={() => navigate('/enroll')}
                    className="bg-[#659BFF] text-white px-10 py-5 rounded-full text-xl font-medium hover:bg-blue-600 transition-colors hover:scale-105 active:scale-95 shadow-md"
                >
                    Create My Praman-ID
                </button>
            </section >

            {/* Footer */}
            < footer className="bg-white text-[#1d1d1f] py-20 px-6 md:px-12" >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16">
                    {/* Column 1: Contact & Subscribe */}
                    <div className="max-w-sm space-y-8">
                        <div>
                            <h4 className="text-gray-400 font-medium mb-2">Contact us at</h4>
                            <a href="mailto:praman@gmail.com" className="text-2xl font-serif font-medium text-[#1d1d1f] hover:text-[#659BFF] transition-colors">
                                praman@gmail.com
                            </a>
                        </div>
                        <form className="relative flex items-center w-full max-w-[320px]">
                            <input
                                type="email"
                                placeholder="name@email.com"
                                className="w-full bg-gray-50 text-black py-4 pl-6 pr-32 rounded-full outline-none focus:ring-2 focus:ring-[#659BFF]/30 transition-all border border-gray-100"
                            />
                            <button
                                type="button"
                                className="absolute right-2 bg-[#659BFF] text-white px-5 py-2.5 rounded-full font-medium hover:bg-blue-600 transition-colors shadow-md text-sm"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>

                    {/* Column 2: Links */}
                    <div className="flex gap-20">
                        <div>
                            <h4 className="text-gray-400 font-medium mb-6">Links</h4>
                            <ul className="space-y-4 text-[#1d1d1f] font-medium opacity-80">
                                <li><a href="#" className="hover:text-[#659BFF] transition-colors">Home</a></li>
                                <li><a href="#features" className="hover:text-[#659BFF] transition-colors">Features</a></li>
                                <li><a href="#pricing" className="hover:text-[#659BFF] transition-colors">Pricing</a></li>
                                <li><a href="#integrations" className="hover:text-[#659BFF] transition-colors">Integrations</a></li>
                                <li><a href="#contact" className="hover:text-[#659BFF] transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-gray-400 font-medium mb-6">More Resources</h4>
                            <ul className="space-y-4 text-[#1d1d1f] font-medium opacity-80">
                                <li><a href="#faq" className="hover:text-[#659BFF] transition-colors">FAQ</a></li>
                                <li><a href="#blog" className="hover:text-[#659BFF] transition-colors">Blog</a></li>
                                <li><a href="#testimonials" className="hover:text-[#659BFF] transition-colors">Testimonials</a></li>
                                <li><a href="#terms" className="hover:text-[#659BFF] transition-colors">Terms</a></li>
                                <li><a href="#privacy" className="hover:text-[#659BFF] transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-gray-100 flex justify-between items-center text-gray-400 text-sm">
                    <p>© 2024 Praman. All rights reserved.</p>
                    <a href="https://lunisdesign.com" target="_blank" rel="noreferrer" className="hover:text-[#659BFF] transition-colors">
                        Designed by Lunis
                    </a>
                </div>
            </footer >
        </div >
    );
}
