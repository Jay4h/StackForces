import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { User, Shield, MapPin, FileText, Phone, Settings, Edit2, Save, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, profile, isAuthenticated, checkProfile, updateProfileState } = useAuth();
    const [loading, setLoading] = useState(false);
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate('/enroll');
            return;
        }
        if (profile) {
            setFormData(profile);
        } else {
            // Check profile if not loaded
            if (user?.did) checkProfile(user.did);
        }
    }, [isAuthenticated, user, navigate, profile, checkProfile]);

    const handleEdit = (section: string) => {
        setEditingSection(section);
        // Initialize form data for that section
        setFormData(profile);
    };

    const handleCancel = () => {
        setEditingSection(null);
        setFormData(profile);
    };

    const handleSave = async (section: string) => {
        if (!user?.did) return;
        setLoading(true);
        try {
            const apiSection = section === 'personalInfo' ? 'personal' :
                section === 'governmentIds' ? 'government-ids' :
                    section === 'emergencyContact' ? 'emergency-contact' :
                        section;

            const API_BASE_URL = 'http://localhost:3000/api';
            const res = await fetch(`${API_BASE_URL}/profile/${user.did}/${apiSection}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData[section])
            });

            const data = await res.json();
            if (data.success) {
                updateProfileState(data.profile);
                setEditingSection(null);
                alert(`${section.replace(/([A-Z])/g, ' $1').trim()} updated successfully!`);
            } else {
                alert(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (section: string, field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    if (!isAuthenticated || !user) return null;

    const sections = [
        {
            id: 'personalInfo',
            title: 'Personal Information',
            icon: User,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            fields: [
                { key: 'firstName', label: 'First Name', type: 'text' },
                { key: 'lastName', label: 'Last Name', type: 'text' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'phone', label: 'Phone', type: 'tel' },
                { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', format: (v: string) => v?.split('T')[0] },
                { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other', 'Prefer not to say'] }
            ]
        },
        {
            id: 'address',
            title: 'Address',
            icon: MapPin,
            color: 'text-green-600',
            bg: 'bg-green-50',
            fields: [
                { key: 'street', label: 'Street', type: 'text' },
                { key: 'city', label: 'City', type: 'text' },
                { key: 'state', label: 'State', type: 'text' },
                { key: 'postalCode', label: 'Postal Code', type: 'text' },
                { key: 'country', label: 'Country', type: 'text', disabled: true }
            ]
        },
        {
            id: 'governmentIds',
            title: 'Government IDs',
            icon: FileText,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            fields: [
                { key: 'aadhar', label: 'Aadhar', type: 'text' },
                { key: 'pan', label: 'PAN', type: 'text' },
                { key: 'passport', label: 'Passport', type: 'text' }
            ]
        },
        {
            id: 'emergencyContact',
            title: 'Emergency Contact',
            icon: Phone,
            color: 'text-red-600',
            bg: 'bg-red-50',
            fields: [
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'relationship', label: 'Relationship', type: 'text' },
                { key: 'phone', label: 'Phone', type: 'tel' }
            ]
        },
        {
            id: 'preferences',
            title: 'Preferences',
            icon: Settings,
            color: 'text-gray-600',
            bg: 'bg-gray-50',
            fields: [
                { key: 'language', label: 'Language', type: 'select', options: ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu'] },
                { key: 'notifications', label: 'Notifications', type: 'checkbox' },
                { key: 'dataSharing', label: 'Data Sharing', type: 'checkbox' }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <main className="pt-28 pb-16 px-4 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-[#1d1d1f] text-white rounded-2xl flex items-center justify-center text-2xl font-bold">
                        {profile?.personalInfo?.firstName?.[0] || 'U'}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {profile?.personalInfo?.firstName} {profile?.personalInfo?.lastName}
                        </h1>
                        <p className="text-gray-500 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-600" />
                            DID: <span className="font-mono text-sm bg-gray-200 px-2 py-0.5 rounded">{user.did}</span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {sections.map((section) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${section.bg}`}>
                                        <section.icon className={`w-5 h-5 ${section.color}`} />
                                    </div>
                                    <h3 className="font-bold text-gray-900">{section.title}</h3>
                                </div>
                                {editingSection === section.id ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleSave(section.id)}
                                            disabled={loading}
                                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={loading}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleEdit(section.id)}
                                        className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {section.fields.map((f: any) => (
                                        <div key={f.key} className={f.type === 'checkbox' ? 'col-span-2 flex items-center justify-between' : ''}>
                                            <label className="block text-sm font-medium text-gray-500 mb-1.5">
                                                {f.label}
                                            </label>
                                            {editingSection === section.id ? (
                                                f.type === 'select' ? (
                                                    <select
                                                        value={formData[section.id]?.[f.key] || ''}
                                                        onChange={(e) => handleChange(section.id, f.key, e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                    >
                                                        {f.options?.map((opt: string) => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                ) : f.type === 'checkbox' ? (
                                                    <div className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData[section.id]?.[f.key] || false}
                                                            onChange={(e) => handleChange(section.id, f.key, e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                    </div>
                                                ) : (
                                                    <input
                                                        type={f.type}
                                                        value={f.format ? f.format(formData[section.id]?.[f.key]) : (formData[section.id]?.[f.key] || '')}
                                                        onChange={(e) => handleChange(section.id, f.key, e.target.value)}
                                                        disabled={f.disabled}
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                                                    />
                                                )
                                            ) : (
                                                <div className="font-medium text-gray-900 break-words">
                                                    {f.type === 'checkbox' ? (
                                                        profile?.[section.id]?.[f.key] ?
                                                            <span className="text-green-600 text-sm bg-green-50 px-2 py-0.5 rounded">Enabled</span> :
                                                            <span className="text-gray-400 text-sm bg-gray-100 px-2 py-0.5 rounded">Disabled</span>
                                                    ) : (
                                                        (f.format ? f.format(profile?.[section.id]?.[f.key]) : profile?.[section.id]?.[f.key]) || <span className="text-gray-400 text-sm italic">Not set</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
}
