import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, User, Check } from 'lucide-react';

export default function MyFamilyPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [family, setFamily] = useState<{ name: string, relation: string, status: string, img: string }[]>([]);

    const [newMember, setNewMember] = useState({
        name: "",
        relation: "Child",
        img: ""
    });

    // Avatar Catalog
    const avatars = [
        "/assets/avatars/user-upload.png", // The uploaded image
        "/assets/avatars/memoji-1.png",
        "/assets/avatars/memoji-2.png",
        "/assets/avatars/memoji-3.png",
        "/assets/avatars/memoji-4.png",
        "/assets/avatars/memoji-5.png",
    ];

    const handleAddMember = () => {
        if (newMember.name && newMember.img) {
            setFamily([...family, { ...newMember, status: "Managed" }]);
            setNewMember({ name: "", relation: "Child", img: "" });
            setIsModalOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-[#1a1a1a] font-sans">
            <Navbar />

            <main className="pt-32 px-6 md:px-10 max-w-[1000px] mx-auto pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">My Family</h1>
                            <p className="text-gray-500 font-medium">Manage your household's digital identities.</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center space-x-2 bg-black text-white px-5 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl active:scale-95 transform"
                        >
                            <Plus size={18} />
                            <span>Add Member</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {family.map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 rounded-[28px] border border-gray-100 bg-white flex flex-col items-center text-center hover:shadow-lg transition-shadow group relative overflow-hidden"
                            >
                                <div className="w-24 h-24 rounded-full bg-gray-50 mb-4 overflow-hidden border-4 border-white shadow-sm ring-1 ring-gray-100">
                                    <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">{member.relation}</p>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${member.status === 'Admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {member.status}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </main>

            {/* Add Member Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <h2 className="text-2xl font-serif font-bold mb-6">Add Family Member</h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={newMember.name}
                                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:border-black transition-all font-medium"
                                        placeholder="e.g. Alice Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Relationship</label>
                                    <select
                                        value={newMember.relation}
                                        onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:border-black transition-all font-medium appearance-none"
                                    >
                                        <option>Spouse</option>
                                        <option>Child</option>
                                        <option>Parent</option>
                                        <option>Sibling</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Choose Avatar</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {avatars.map((avatar, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setNewMember({ ...newMember, img: avatar })}
                                                className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all relative group ${newMember.img === avatar
                                                    ? "border-black ring-2 ring-black/20"
                                                    : "border-transparent hover:border-gray-200"
                                                    }`}
                                            >
                                                <img src={avatar} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                                                {newMember.img === avatar && (
                                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                        <div className="bg-white rounded-full p-1 shadow-sm">
                                                            <Check size={12} className="text-black" />
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddMember}
                                    disabled={!newMember.name || !newMember.img}
                                    className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg active:scale-[0.98]"
                                >
                                    Add Member
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
