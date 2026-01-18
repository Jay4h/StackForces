import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MicroservicesDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeService, setActiveService] = useState<string | null>(null);
    const [serviceResponse, setServiceResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Test microservice endpoints
    const testService = async (serviceUrl: string, serviceName: string) => {
        setLoading(true);
        setActiveService(serviceName);

        try {
            const response = await fetch(serviceUrl);
            const data = await response.json();
            setServiceResponse(data);
        } catch (error) {
            setServiceResponse({ error: 'Service not available. Run: docker-compose -f docker-compose.microservices.yml up -d' });
        } finally {
            setLoading(false);
        }
    };

    const services = [
        {
            id: 'did-registry',
            name: 'DID Registry',
            port: 3001,
            icon: '🔍',
            color: 'from-blue-500 to-cyan-500',
            description: 'Public, read-only DID resolver',
            features: ['W3C DID Documents', 'Public key resolution', 'Deactivation support'],
            endpoint: 'http://localhost:3001/health',
            status: 'Stateless',
        },
        {
            id: 'issuer',
            name: 'Issuer Service',
            port: 3002,
            icon: '📜',
            color: 'from-green-500 to-emerald-500',
            description: 'Issues Verifiable Credentials',
            features: ['Sign credentials', 'Revocation support', 'W3C VC format'],
            endpoint: 'http://localhost:3002/health',
            status: 'Stateless',
        },
        {
            id: 'verifier',
            name: 'Verifier Service',
            port: 3003,
            icon: '✅',
            color: 'from-purple-500 to-pink-500',
            description: 'Verifies credentials (100% stateless!)',
            features: ['Offline verification', 'No database', 'Infinite scaling'],
            endpoint: 'http://localhost:3003/health',
            status: '🔥 Stateless + DB-less',
        },
        {
            id: 'wallet',
            name: 'Wallet Backend',
            port: 3004,
            icon: '💳',
            color: 'from-orange-500 to-red-500',
            description: 'Citizen credential wallet',
            features: ['Encrypted storage', 'Pairwise DIDs', 'Selective disclosure'],
            endpoint: 'http://localhost:3004/health',
            status: 'User-controlled',
        },
    ];

    const healthcareFlows = [
        {
            id: 'flow-a',
            name: 'Flow A: Appointment Booking',
            icon: '📅',
            color: 'from-indigo-500 to-blue-500',
            description: 'Mutual authentication without PII sharing',
            steps: [
                'Patient proves: "I am valid"',
                'Doctor proves: "I am licensed"',
                'Hospital proves: "I am accredited"',
                '✅ Booking succeeds WITHOUT identity numbers',
            ],
            route: '/flow-a-demo',
        },
        {
            id: 'flow-b',
            name: 'Flow B: Doctor Accessing Records',
            icon: '🩺',
            color: 'from-green-500 to-teal-500',
            description: 'Consent-based, time-limited access',
            steps: [
                'Doctor requests specific report',
                'Patient wallet shows popup',
                'Fingerprint approval (2-hour time limit)',
                '✅ Offline verification, NO central server',
            ],
            route: '/flow-b-demo',
        },
        {
            id: 'flow-c',
            name: 'Flow C: Lab → Patient → Doctor',
            icon: '🔬',
            color: 'from-yellow-500 to-orange-500',
            description: 'DATA EXCHANGE WITHOUT DATA MOVEMENT 🔥',
            steps: [
                'Lab issues LabReportVC → Patient',
                'Patient stores in wallet (encrypted)',
                'Patient shares with doctor (weeks later)',
                '✅ Doctor verifies offline, NO lab contact',
            ],
            route: '/flow-c-demo',
        },
        {
            id: 'flow-d',
            name: 'Flow D: Emergency Access',
            icon: '🚨',
            color: 'from-red-500 to-pink-500',
            description: 'Pre-authorized emergency credentials',
            steps: [
                'Patient pre-approves EmergencySummaryVC',
                'Generates temp Emergency DID + QR code',
                'ER scans QR → Auto-approved access',
                '✅ Audit log when patient wakes up',
            ],
            route: '/flow-d-demo',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
            {/* Header */}
            <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                🇮🇳 Praman Microservices
                            </h1>
                            <p className="text-blue-200 mt-1">
                                Production-ready decentralized identity infrastructure
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all"
                        >
                            ← Back to Home
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <div className="text-4xl mb-2">4</div>
                        <div className="text-white text-lg font-semibold">Microservices</div>
                        <div className="text-blue-200 text-sm">Stateless & Scalable</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <div className="text-4xl mb-2">5</div>
                        <div className="text-white text-lg font-semibold">Credentials</div>
                        <div className="text-green-200 text-sm">W3C Verifiable</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <div className="text-4xl mb-2">4</div>
                        <div className="text-white text-lg font-semibold">Healthcare Flows</div>
                        <div className="text-purple-200 text-sm">Linked & Live</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                        <div className="text-4xl mb-2">∞</div>
                        <div className="text-white text-lg font-semibold">Scalability</div>
                        <div className="text-orange-200 text-sm">Horizontal Scaling</div>
                    </div>
                </div>

                {/* Microservices Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <span className="text-4xl">🔧</span>
                        Core Microservices
                    </h2>
                    <p className="text-blue-200 mb-8">
                        4 stateless services | JSON-only | No PII | DID-first architecture
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`text-5xl bg-gradient-to-br ${service.color} p-4 rounded-xl`}>
                                            {service.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">{service.name}</h3>
                                            <p className="text-gray-300">Port {service.port}</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-200 text-sm">
                                        {service.status}
                                    </span>
                                </div>

                                <p className="text-gray-300 mb-4">{service.description}</p>

                                <div className="space-y-2 mb-4">
                                    {service.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                                            <span className="text-green-400">✓</span>
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => testService(service.endpoint, service.name)}
                                    disabled={loading && activeService === service.name}
                                    className={`w-full py-3 rounded-lg font-semibold transition-all bg-gradient-to-r ${service.color} text-white hover:scale-105 disabled:opacity-50`}
                                >
                                    {loading && activeService === service.name ? 'Testing...' : 'Test Service →'}
                                </button>

                                {activeService === service.name && serviceResponse && (
                                    <div className="mt-4 p-4 bg-black/30 rounded-lg border border-white/10">
                                        <div className="text-xs text-gray-300 font-mono overflow-auto max-h-40">
                                            {JSON.stringify(serviceResponse, null, 2)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Healthcare Flows Section */}
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <span className="text-4xl">🔗</span>
                        Linked Healthcare Flows
                    </h2>
                    <p className="text-blue-200 mb-8">
                        Interactive demonstrations of decentralized healthcare workflows
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {healthcareFlows.map((flow) => (
                            <div
                                key={flow.id}
                                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`text-4xl bg-gradient-to-br ${flow.color} p-3 rounded-xl`}>
                                        {flow.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white">{flow.name}</h3>
                                        <p className="text-gray-300 text-sm mt-1">{flow.description}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    {flow.steps.map((step, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <span className="text-blue-400 font-semibold mt-1 min-w-[24px]">{idx + 1}.</span>
                                            <span className="text-gray-300 text-sm">{step}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => navigate(flow.route)}
                                    className={`w-full py-3 rounded-lg font-semibold transition-all bg-gradient-to-r ${flow.color} text-white hover:scale-105`}
                                >
                                    Try Interactive Demo →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-white mb-4">🚀 Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/credentials')}
                            className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all text-left"
                        >
                            <div className="text-2xl mb-2">📜</div>
                            <div className="font-semibold">My Credentials</div>
                            <div className="text-sm text-gray-300">View all 5 types</div>
                        </button>
                        <button
                            onClick={() => navigate('/did-manager')}
                            className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all text-left"
                        >
                            <div className="text-2xl mb-2">🆔</div>
                            <div className="font-semibold">DID Manager</div>
                            <div className="text-sm text-gray-300">Manage pairwise DIDs</div>
                        </button>
                        <button
                            onClick={() => navigate('/kill-switch')}
                            className="p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all text-left"
                        >
                            <div className="text-2xl mb-2">🔴</div>
                            <div className="font-semibold">Kill Switch</div>
                            <div className="text-sm text-gray-300">Revoke access instantly</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MicroservicesDashboard;
