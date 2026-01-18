import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, FileText, Phone, Settings, Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

const steps = [
    { id: 'personal', title: 'Personal Info', icon: User },
    { id: 'address', title: 'Address', icon: MapPin },
    { id: 'governmentIds', title: 'Government IDs', icon: FileText },
    { id: 'emergency', title: 'Emergency Contact', icon: Phone },
    { id: 'preferences', title: 'Preferences', icon: Settings }
];

export default function ProfileOnboarding({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { user, profile, updateProfileState } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({
        personalInfo: {
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: '',
            email: '',
            phone: ''
        },
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'India'
        },
        governmentIds: {
            aadhar: '',
            pan: '',
            passport: '',
            drivingLicense: ''
        },
        emergencyContact: {
            name: '',
            relationship: '',
            phone: ''
        },
        preferences: {
            language: 'English',
            notifications: true,
            dataSharing: false
        }
    });

    useEffect(() => {
        if (profile) {
            setFormData((prev: any) => ({
                ...prev,
                personalInfo: { ...prev.personalInfo, ...profile.personalInfo },
                address: { ...prev.address, ...profile.address },
                governmentIds: { ...prev.governmentIds, ...profile.governmentIds },
                emergencyContact: { ...prev.emergencyContact, ...profile.emergencyContact },
                preferences: { ...prev.preferences, ...profile.preferences }
            }));
        }
    }, [profile]);

    const handleInputChange = (section: string, field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!user?.did) return;
        setLoading(true);

        try {
            const res = await fetch('http://localhost:3000/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    did: user.did,
                    ...formData
                })
            });

            const data = await res.json();

            if (data.success) {
                updateProfileState(data.profile);
                onClose();
            } else {
                alert(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const CurrentIcon = steps[currentStep].icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="bg-[#1d1d1f] text-white p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold">Complete Your Profile</h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                        <CurrentIcon className="w-6 h-6 text-white" />
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-gray-100 flex">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`h-full flex-1 transition-colors duration-300 ${index <= currentStep ? 'bg-blue-600' : 'bg-transparent'}`}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {renderStepContent(currentStep, formData, handleInputChange)}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-between bg-gray-50">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0 || loading}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-colors ${currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 bg-[#1d1d1f] text-white rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : currentStep === steps.length - 1 ? (
                            <>Complete <Check className="w-4 h-4" /></>
                        ) : (
                            <>Next <ChevronRight className="w-4 h-4" /></>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function renderStepContent(step: number, data: any, onChange: Function) {
    const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

    switch (step) {
        case 0: // Personal Info
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClass}>First Name *</label>
                        <input
                            type="text"
                            value={data.personalInfo.firstName}
                            onChange={(e) => onChange('personalInfo', 'firstName', e.target.value)}
                            className={inputClass}
                            placeholder="John"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Last Name *</label>
                        <input
                            type="text"
                            value={data.personalInfo.lastName}
                            onChange={(e) => onChange('personalInfo', 'lastName', e.target.value)}
                            className={inputClass}
                            placeholder="Doe"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Email *</label>
                        <input
                            type="email"
                            value={data.personalInfo.email}
                            onChange={(e) => onChange('personalInfo', 'email', e.target.value)}
                            className={inputClass}
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Phone</label>
                        <input
                            type="tel"
                            value={data.personalInfo.phone}
                            onChange={(e) => onChange('personalInfo', 'phone', e.target.value)}
                            className={inputClass}
                            placeholder="+91 98765 43210"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Date of Birth</label>
                        <input
                            type="date"
                            value={data.personalInfo.dateOfBirth?.split('T')[0]}
                            onChange={(e) => onChange('personalInfo', 'dateOfBirth', e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Gender</label>
                        <select
                            value={data.personalInfo.gender}
                            onChange={(e) => onChange('personalInfo', 'gender', e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>
                </div>
            );
        case 1: // Address
            return (
                <div className="space-y-6">
                    <div>
                        <label className={labelClass}>Street Address</label>
                        <input
                            type="text"
                            value={data.address.street}
                            onChange={(e) => onChange('address', 'street', e.target.value)}
                            className={inputClass}
                            placeholder="123 Main St, Apt 4B"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>City</label>
                            <input
                                type="text"
                                value={data.address.city}
                                onChange={(e) => onChange('address', 'city', e.target.value)}
                                className={inputClass}
                                placeholder="Mumbai"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>State</label>
                            <input
                                type="text"
                                value={data.address.state}
                                onChange={(e) => onChange('address', 'state', e.target.value)}
                                className={inputClass}
                                placeholder="Maharashtra"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className={labelClass}>Postal Code</label>
                            <input
                                type="text"
                                value={data.address.postalCode}
                                onChange={(e) => onChange('address', 'postalCode', e.target.value)}
                                className={inputClass}
                                placeholder="400001"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Country</label>
                            <input
                                type="text"
                                value={data.address.country}
                                onChange={(e) => onChange('address', 'country', e.target.value)}
                                className={inputClass}
                                disabled
                            />
                        </div>
                    </div>
                </div>
            );
        case 2: // Government IDs
            return (
                <div className="space-y-6">
                    <div>
                        <label className={labelClass}>Aadhar Number (Optional)</label>
                        <input
                            type="text"
                            value={data.governmentIds.aadhar}
                            onChange={(e) => onChange('governmentIds', 'aadhar', e.target.value)}
                            className={inputClass}
                            placeholder="XXXX XXXX XXXX"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>PAN Number (Optional)</label>
                        <input
                            type="text"
                            value={data.governmentIds.pan}
                            onChange={(e) => onChange('governmentIds', 'pan', e.target.value)}
                            className={inputClass}
                            placeholder="ABCDE1234F"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Passport Number (Optional)</label>
                        <input
                            type="text"
                            value={data.governmentIds.passport}
                            onChange={(e) => onChange('governmentIds', 'passport', e.target.value)}
                            className={inputClass}
                            placeholder="A1234567"
                        />
                    </div>
                </div>
            );
        case 3: // Emergency Contact
            return (
                <div className="space-y-6">
                    <div>
                        <label className={labelClass}>Contact Name</label>
                        <input
                            type="text"
                            value={data.emergencyContact.name}
                            onChange={(e) => onChange('emergencyContact', 'name', e.target.value)}
                            className={inputClass}
                            placeholder="Jane Doe"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Relationship</label>
                        <input
                            type="text"
                            value={data.emergencyContact.relationship}
                            onChange={(e) => onChange('emergencyContact', 'relationship', e.target.value)}
                            className={inputClass}
                            placeholder="Spouse, Parent, etc."
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Phone Number</label>
                        <input
                            type="tel"
                            value={data.emergencyContact.phone}
                            onChange={(e) => onChange('emergencyContact', 'phone', e.target.value)}
                            className={inputClass}
                            placeholder="+91 98765 43210"
                        />
                    </div>
                </div>
            );
        case 4: // Preferences
            return (
                <div className="space-y-6">
                    <div>
                        <label className={labelClass}>Preferred Language</label>
                        <select
                            value={data.preferences.language}
                            onChange={(e) => onChange('preferences', 'language', e.target.value)}
                            className={inputClass}
                        >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Marathi">Marathi</option>
                            <option value="Tamil">Tamil</option>
                            <option value="Telugu">Telugu</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                            <p className="font-medium text-gray-900">Enable Notifications</p>
                            <p className="text-sm text-gray-500">Receive alerts about your account</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.preferences.notifications}
                                onChange={(e) => onChange('preferences', 'notifications', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                            <p className="font-medium text-gray-900">Data Sharing</p>
                            <p className="text-sm text-gray-500">Allow sharing data with verified services</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.preferences.dataSharing}
                                onChange={(e) => onChange('preferences', 'dataSharing', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            );
        default:
            return null;
    }
}
