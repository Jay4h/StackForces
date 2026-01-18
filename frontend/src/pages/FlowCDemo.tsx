import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FlowCDemo: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [labReport, setLabReport] = useState<any>(null);
    const [storedInWallet, setStoredInWallet] = useState(false);
    const [sharedWithDoctor, setSharedWithDoctor] = useState(false);
    const [verificationResult, setVerificationResult] = useState<any>(null);

    const steps = [
        {
            id: 0,
            title: 'Lab Issues Report',
            actor: 'Lab (PathCare Mumbai)',
            icon: '🔬',
            color: 'from-blue-500 to-cyan-500',
            description: 'Lab completes blood test and issues LabReportVC to patient',
        },
        {
            id: 1,
            title: 'Patient Stores in Wallet',
            actor: 'Patient',
            icon: '💳',
            color: 'from-green-500 to-emerald-500',
            description: 'Patient receives credential and stores it encrypted in wallet',
        },
        {
            id: 2,
            title: 'Patient Shares with Doctor (Weeks Later)',
            actor: 'Patient',
            icon: '📤',
            color: 'from-purple-500 to-pink-500',
            description: 'Patient visits different doctor and creates Verifiable Presentation',
        },
        {
            id: 3,
            title: 'Doctor Verifies Offline',
            actor: 'Doctor (Different Hospital)',
            icon: '✅',
            color: 'from-orange-500 to-red-500',
            description: 'Doctor verifies signature WITHOUT contacting lab',
        },
    ];

    const issueLabReport = () => {
        const report = {
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential', 'LabReportVC'],
            issuer: 'did:praman:lab:pathcare-mumbai',
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
                id: 'did:praman:pairwise:lab-patient-123',
                type: 'LabReport',
                reportId: 'LAB-2026-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                testName: 'Complete Blood Count (CBC)',
                testDate: '2026-01-18',
                results: {
                    hemoglobin: '14.5 g/dL',
                    wbcCount: '7500 cells/μL',
                    plateletCount: '250000 cells/μL',
                    rbc: '4.8 million/μL',
                },
                referenceRanges: {
                    hemoglobin: '13.5-17.5 g/dL',
                    wbcCount: '4000-11000 cells/μL',
                },
                remark: 'All values within normal range',
                performedBy: 'did:praman:lab:pathcare-mumbai',
                verifiedBy: 'did:praman:doctor:pathologist-456',
            },
            proof: {
                type: 'EcdsaSecp256k1Signature2019',
                created: new Date().toISOString(),
                proofPurpose: 'assertionMethod',
                verificationMethod: 'did:praman:lab:pathcare-mumbai#key-1',
                jws: 'eyJhbGc...' + btoa(Math.random().toString()),
            },
        };

        setLabReport(report);
        setCurrentStep(1);
    };

    const storeInWallet = () => {
        setStoredInWallet(true);
        setCurrentStep(2);
    };

    const shareWithDoctor = () => {
        setSharedWithDoctor(true);
        setCurrentStep(3);

        // Simulate offline verification
        setTimeout(() => {
            setVerificationResult({
                verified: true,
                issuer: 'did:praman:lab:pathcare-mumbai',
                subject: 'did:praman:pairwise:lab-patient-123',
                issuanceDate: labReport?.issuanceDate,
                message: '✅ Lab results authentic! Verified offline without contacting lab.',
                checks: {
                    signatureValid: true,
                    issuerTrusted: true,
                    notRevoked: true,
                    notExpired: true,
                },
            });
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
            {/* Header */}
            <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                🔬 Flow C: Lab → Patient → Doctor
                            </h1>
                            <p className="text-blue-200 mt-1">
                                Data Exchange WITHOUT Data Movement 🔥
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/microservices')}
                            className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Progress Steps */}
                <div className="mb-12">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute top-8 left-0 right-0 h-1 bg-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                            />
                        </div>

                        {steps.map((step, idx) => (
                            <div key={step.id} className="relative flex flex-col items-center z-10">
                                <div
                                    className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${idx <= currentStep
                                        ? `bg-gradient-to-br ${step.color} scale-110`
                                        : 'bg-gray-700'
                                        }`}
                                >
                                    {step.icon}
                                </div>
                                <div className="mt-4 text-center max-w-[200px]">
                                    <div className={`font-semibold ${idx <= currentStep ? 'text-white' : 'text-gray-400'}`}>
                                        Step {idx + 1}
                                    </div>
                                    <div className={`text-sm mt-1 ${idx <= currentStep ? 'text-blue-200' : 'text-gray-500'}`}>
                                        {step.title}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Current Step Details */}
                    <div className="space-y-6">
                        <div className={`bg-gradient-to-br ${steps[currentStep].color}/20 backdrop-blur-md border border-white/10 rounded-2xl p-8`}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`text-5xl bg-gradient-to-br ${steps[currentStep].color} p-4 rounded-xl`}>
                                    {steps[currentStep].icon}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{steps[currentStep].title}</h2>
                                    <p className="text-gray-300">Actor: {steps[currentStep].actor}</p>
                                </div>
                            </div>

                            <p className="text-gray-200 text-lg mb-6">{steps[currentStep].description}</p>

                            {/* Step-specific actions */}
                            {currentStep === 0 && (
                                <button
                                    onClick={issueLabReport}
                                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white font-semibold hover:scale-105 transition-all"
                                >
                                    Issue Lab Report →
                                </button>
                            )}

                            {currentStep === 1 && labReport && (
                                <button
                                    onClick={storeInWallet}
                                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white font-semibold hover:scale-105 transition-all"
                                >
                                    Store in Wallet (Encrypted) →
                                </button>
                            )}

                            {currentStep === 2 && storedInWallet && (
                                <button
                                    onClick={shareWithDoctor}
                                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:scale-105 transition-all"
                                >
                                    Create Verifiable Presentation →
                                </button>
                            )}

                            {currentStep === 3 && verificationResult && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                                        <div className="flex items-center gap-2 text-green-200 font-semibold">
                                            ✅ {verificationResult.message}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {Object.entries(verificationResult.checks).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                                <span className="text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                <span className={value ? 'text-green-400' : 'text-red-400'}>
                                                    {value ? '✓ Pass' : '✗ Fail'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Key Point */}
                        <div className="bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-6">
                            <div className="flex items-start gap-3">
                                <span className="text-3xl">💡</span>
                                <div>
                                    <h3 className="text-yellow-200 font-semibold text-lg mb-2">The Killer Feature</h3>
                                    <p className="text-yellow-100">
                                        Lab and Doctor <strong>NEVER communicate</strong>. Patient is the data conduit.
                                        Doctor verifies the lab's cryptographic signature offline. This is <strong>true decentralization</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Data View */}
                    <div className="space-y-6">
                        {labReport && (
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4">📄 Lab Report Credential</h3>

                                <div className="space-y-4">
                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">Report ID</div>
                                        <div className="text-white font-mono">{labReport.credentialSubject.reportId}</div>
                                    </div>

                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">Test Name</div>
                                        <div className="text-white">{labReport.credentialSubject.testName}</div>
                                    </div>

                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">Results</div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {Object.entries(labReport.credentialSubject.results).map(([key, value]) => (
                                                <div key={key} className="p-3 bg-white/5 rounded-lg">
                                                    <div className="text-gray-400 text-xs capitalize">{key}</div>
                                                    <div className="text-white font-semibold">{value as string}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">Issuer (Lab)</div>
                                        <div className="text-white font-mono text-sm truncate">{labReport.issuer}</div>
                                    </div>

                                    <div>
                                        <div className="text-gray-400 text-sm mb-1">Cryptographic Proof</div>
                                        <div className="p-3 bg-black/30 rounded-lg">
                                            <div className="text-green-400 text-xs font-mono truncate">{labReport.proof.jws}</div>
                                        </div>
                                    </div>
                                </div>

                                {storedInWallet && currentStep >= 1 && (
                                    <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                                        <div className="flex items-center gap-2 text-green-200">
                                            <span>🔒</span>
                                            <span className="font-semibold">Stored encrypted in wallet</span>
                                        </div>
                                        <div className="text-green-100 text-sm mt-1">
                                            Lab does NOT keep copy. Patient has full control.
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Technical Explanation */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">🔧 How It Works</h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-3">
                                    <span className="text-blue-400 font-bold">1.</span>
                                    <div className="text-gray-300">
                                        Lab signs credential with <strong>private key</strong> (stored in HSM)
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <span className="text-blue-400 font-bold">2.</span>
                                    <div className="text-gray-300">
                                        Patient receives credential, stores <strong>encrypted</strong> (AES-256-GCM)
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <span className="text-blue-400 font-bold">3.</span>
                                    <div className="text-gray-300">
                                        Doctor resolves lab's DID from <strong>DID Registry</strong> (gets public key)
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <span className="text-blue-400 font-bold">4.</span>
                                    <div className="text-gray-300">
                                        Doctor verifies signature using lab's <strong>public key</strong> (offline!)
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <span className="text-blue-400 font-bold">5.</span>
                                    <div className="text-gray-300">
                                        Doctor checks revocation status (cached, less than2ms)
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <span className="text-green-400 font-bold">✓</span>
                                    <div className="text-green-300 font-semibold">
                                        Trust established WITHOUT data movement!
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlowCDemo;
