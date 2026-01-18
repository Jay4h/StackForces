import React, { useRef } from 'react';
import Navbar from '../components/Navbar';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

/**
 * HomePage Component
 * Replicates the "Lunera" Framer landing page layout.
 * Improvements:
 * - Removed redundant camera dot.
 * - Split grid layout (Headline left, Description right).
 * - Refined typography and navbar spacing.
 */
export default function HomePage() {
    const containerRef = useRef(null);

    // Track scroll progress within the container for parallax
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Spring physics for smooth movement
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Parallax transformations - Move up to position, then FIX
    // 0 to 0.5: Mockup moves from "user-defined start" (150px down) to aligned position (-200px)
    const mobileY = useTransform(smoothProgress, [0, 0.5, 1], [80, -200, -200]);
    const mobileScale = useTransform(smoothProgress, [0, 0.5], [1, 1]); // No scale change

    // Side components locked to mobileY
    const leftCardY = mobileY;
    const rightCardY = mobileY;
    const bottomBadgeY = mobileY;

    return (
        <div ref={containerRef} className="min-h-[250vh] bg-white text-[#1a1a1a] selection:bg-blue-100 font-sans">
            {/* Navbar: Matching the reference layout */}
            {/* Navbar: Matching the reference layout */}
            <Navbar />

            {/* Hero Content Section */}
            <div className="sticky top-0 h-screen flex flex-col justify-start pt-44 overflow-hidden">
                <div className="max-w-[1300px] mx-auto px-10 w-full grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-x-20 items-start">

                    {/* Left Side: Large Headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <h1 className="text-6xl md:text-[92px] font-bold tracking-[-0.04em] leading-[0.92]">
                            Identity with Integrity,<br />
                            Verify with Confidence
                        </h1>
                    </motion.div>

                    {/* Right Side: Description & Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col items-start lg:pt-3 space-y-8"
                    >
                        <p className="text-lg md:text-[19px] text-gray-500 leading-relaxed font-medium max-w-[380px]">
                            The world's most secure self-sovereign identity platform. Your data, your rules.
                        </p>
                        <button className="bg-white text-black border-4 border-double border-black px-9 py-3.5 text-[19px] font-serif hover:bg-black hover:text-white transition-all duration-300 rounded-none active:scale-95">
                            Get Started
                        </button>
                    </motion.div>
                </div>

                {/* Visual Parallax Area */}
                <div className="relative w-full flex justify-center mt-20">
                    {/* Main Mobile Screen Mockup */}
                    <motion.div
                        style={{ y: mobileY, scale: mobileScale }}
                        className="relative z-20 w-[220px] md:w-[320px] aspect-[0.463/1] bg-[#fdfdfd] rounded-[2.5rem] overflow-hidden shadow-[0_60px_120px_-30px_rgba(0,0,0,0.1)] ring-1 ring-gray-100/50"
                    >
                        <img
                            src="https://framerusercontent.com/images/8EqJJl7WcpFsqJnET6imexN7M0.png"
                            alt="Lunera Dashboard"
                            className="w-full h-full object-cover"
                        />
                        {/* Note: The "camera dot" has been removed as requested */}
                    </motion.div>

                    {/* Floating UI: Slider Card (Left) */}
                    <motion.div
                        style={{ y: leftCardY }}
                        className="absolute left-[5%] md:left-[calc(50%-360px)] top-[15%] z-10 hidden md:block"
                    >
                        <div className="bg-white/90 backdrop-blur-2xl p-6 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] border border-white w-[220px]">
                            <div className="flex justify-between items-center mb-5">
                                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400 font-bold">Verifications: 12,545</span>
                            </div>
                            <div className="h-[5px] w-full bg-gray-100 rounded-full relative">
                                <div className="absolute left-0 top-0 h-full w-[75%] bg-[#4D89FF] rounded-full" />
                                <div className="absolute left-[73%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-[3px] border-[#4D89FF] rounded-full shadow-lg" />
                            </div>
                            <div className="flex justify-between mt-3 text-[10px] text-gray-400 font-bold">
                                <span>0</span>
                                <span>5k</span>
                                <span>15k</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Floating UI: Label Badge (Top Right) */}
                    <motion.div
                        style={{ y: rightCardY }}
                        className="absolute right-[5%] md:right-[calc(50%-320px)] top-[5%] z-10 hidden lg:block"
                    >
                        <div className="bg-black text-white px-5 py-3 rounded-full flex items-center space-x-2.5 shadow-2xl">
                            <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-green-400 rounded-full" />
                            </div>
                            <span className="text-[13px] font-bold">Privacy Score: A+</span>
                        </div>
                    </motion.div>

                    {/* Floating UI: Music/Entertainment Card (Bottom Right) */}
                    <motion.div
                        style={{ y: rightCardY }}
                        className="absolute right-[8%] md:right-[calc(50%-340px)] top-[45%] z-10 hidden sm:block"
                    >
                        <div className="bg-white/95 backdrop-blur-2xl p-5 rounded-[28px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-white flex items-center space-x-5 w-[190px]">
                            <div className="w-13 h-13 bg-blue-50 rounded-2xl flex items-center justify-center text-[#4D89FF]">
                                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                            </div>
                            <div>
                                <div className="text-lg font-bold">Verified</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Government Services</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Floating UI: Tooltip Badge (Bottom Left) */}
                    <motion.div
                        style={{ y: bottomBadgeY }}
                        className="absolute left-[10%] md:left-[calc(50%-360px)] top-[60%] z-10 hidden lg:block"
                    >
                        <div className="bg-black text-white px-6 py-3.5 rounded-full flex items-center space-x-2.5 shadow-2xl">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                            <span className="text-[13px] font-bold">Zero-Knowledge Proofs</span>
                        </div>
                    </motion.div>
                </div>
            </div>


        </div>
    );
}
