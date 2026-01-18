/**
 * ========================================
 * HEALTHCARE CREDENTIAL SCHEMAS
 * ========================================
 * TypeScript types for the 5 core VCs
 * These ensure type safety across services
 * ========================================
 */

// Base Verifiable Credential structure
export interface VerifiableCredential {
    '@context': string[];
    type: string[];
    issuer: string; // DID
    issuanceDate: string;
    expirationDate?: string;
    credentialSubject: CredentialSubject;
    proof: CredentialProof;
    id?: string;
}

export interface CredentialSubject {
    id: string; // Subject's DID
    type: string;
    [key: string]: any;
}

export interface CredentialProof {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    jws: string;
    challenge?: string;
}

// ========================================
// 1. PATIENT BASIC VC
// ========================================

export interface PatientBasicVC extends VerifiableCredential {
    type: ['VerifiableCredential', 'PatientBasicVC'];
    credentialSubject: PatientBasicSubject;
}

export interface PatientBasicSubject extends CredentialSubject {
    type: 'Patient';
    age?: number;
    gender?: 'Male' | 'Female' | 'Other';
    bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    allergies?: string[];
    height?: number; // cm
    weight?: number; // kg
}

// Selective disclosure fields
export type PatientBasicField = 'age' | 'gender' | 'bloodGroup' | 'allergies' | 'height' | 'weight';

// ========================================
// 2. DOCTOR LICENSE VC
// ========================================

export interface DoctorLicenseVC extends VerifiableCredential {
    type: ['VerifiableCredential', 'DoctorLicenseVC'];
    credentialSubject: DoctorLicenseSubject;
}

export interface DoctorLicenseSubject extends CredentialSubject {
    type: 'MedicalPractitioner';
    licenseNumber: string;
    name: string;
    specialization: string;
    qualifications: string[];
    registrationDate: string;
    status: 'Active' | 'Suspended' | 'Revoked';
    medicalCouncil?: string;
}

// ========================================
// 3. HOSPITAL ACCREDITATION VC
// ========================================

export interface HospitalAccreditationVC extends VerifiableCredential {
    type: ['VerifiableCredential', 'HospitalAccreditationVC'];
    credentialSubject: HospitalAccreditationSubject;
}

export interface HospitalAccreditationSubject extends CredentialSubject {
    type: 'HealthcareFacility';
    name: string;
    accreditationLevel: 'NABH' | 'JCI' | 'ISO' | 'None';
    registrationNumber: string;
    address: string;
    specialties: string[];
    emergencyServices: boolean;
    bedCapacity?: number;
}

// ========================================
// 4. LAB REPORT VC
// ========================================

export interface LabReportVC extends VerifiableCredential {
    type: ['VerifiableCredential', 'LabReportVC'];
    credentialSubject: LabReportSubject;
}

export interface LabReportSubject extends CredentialSubject {
    type: 'LabReport';
    reportId: string;
    testName: string;
    testDate: string;
    results: Record<string, string | number>;
    referenceRanges?: Record<string, string>;
    remark?: string;
    performedBy: string; // Lab DID
    verifiedBy?: string; // Pathologist DID
}

// ========================================
// 5. EMERGENCY SUMMARY VC
// ========================================

export interface EmergencySummaryVC extends VerifiableCredential {
    type: ['VerifiableCredential', 'EmergencySummaryVC'];
    credentialSubject: EmergencySummarySubject;
}

export interface EmergencySummarySubject extends CredentialSubject {
    type: 'EmergencyContact';
    bloodGroup: string;
    allergies: string[];
    chronicConditions: string[];
    currentMedications: string[];
    emergencyContact: {
        name: string;
        relationship: string;
        phone: string;
    };
    organDonor?: boolean;
    advanceDirectives?: string;
}

// ========================================
// HEALTHCARE ACTORS (DID TYPES)
// ========================================

export type HealthcareActorType =
    | 'Patient'
    | 'Doctor'
    | 'Hospital'
    | 'Lab'
    | 'Insurer'
    | 'Government';

export interface HealthcareActor {
    did: string;
    type: HealthcareActorType;
    credentials: VerifiableCredential[];
    pairwiseDIDs?: Record<string, string>; // For patients only
}

export interface PatientActor extends HealthcareActor {
    type: 'Patient';
    rootDID: string;
    pairwiseDIDs: Record<string, string>;
}

export interface DoctorActor extends HealthcareActor {
    type: 'Doctor';
    license: DoctorLicenseVC;
}

export interface HospitalActor extends HealthcareActor {
    type: 'Hospital';
    accreditation: HospitalAccreditationVC;
}

export interface LabActor extends HealthcareActor {
    type: 'Lab';
    issuingCapability: true;
}

export interface InsurerActor extends HealthcareActor {
    type: 'Insurer';
    verificationCapability: true;
}

// ========================================
// VERIFIABLE PRESENTATION
// ========================================

export interface VerifiablePresentation {
    '@context': string[];
    type: 'VerifiablePresentation';
    holder: string; // DID
    verifiableCredential: VerifiableCredential[];
    proof: {
        type: string;
        created: string;
        challenge?: string;
        proofPurpose: string;
        verificationMethod: string;
        jws: string;
    };
}

// ========================================
// API REQUEST/RESPONSE TYPES
// ========================================

export interface DIDAuthRequest {
    did: string;
    pairwiseDID?: string;
    proof?: string; // JWT or JWS
    presentation?: VerifiablePresentation;
}

export interface CredentialIssuanceRequest {
    issuerDID: string;
    subjectDID: string;
    credentialType: 'PatientBasicVC' | 'DoctorLicenseVC' | 'HospitalAccreditationVC' | 'LabReportVC' | 'EmergencySummaryVC';
    claims: Record<string, any>;
    expirationDate?: string;
}

export interface CredentialVerificationRequest {
    credential: VerifiableCredential;
    presentation?: VerifiablePresentation;
}

export interface CredentialVerificationResponse {
    verified: boolean;
    issuer?: string;
    subject?: string;
    issuanceDate?: string;
    reason?: string;
    revoked?: boolean;
}

export interface SelectiveDisclosureRequest {
    masterDID: string;
    credentialId: string;
    disclosedFields: PatientBasicField[];
}

// ========================================
// HELPER TYPES
// ========================================

export type CredentialType =
    | 'PatientBasicVC'
    | 'DoctorLicenseVC'
    | 'HospitalAccreditationVC'
    | 'LabReportVC'
    | 'EmergencySummaryVC';

export interface CredentialMetadata {
    id: string;
    type: CredentialType;
    issuer: string;
    issuanceDate: Date;
    expirationDate?: Date;
    revoked: boolean;
}

// ========================================
// EXPORTS
// ========================================

export type {
    VerifiableCredential,
    CredentialSubject,
    CredentialProof,
    VerifiablePresentation,
};
