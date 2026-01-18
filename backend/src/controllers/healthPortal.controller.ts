import { Request, Response } from 'express';
import { DIDModel } from '../models/did.model';
import { HealthUserModel } from '../models/healthUser.model';
import { HealthRecordModel } from '../models/healthRecord.model';
import { UserProfileModel } from '../models/userProfile.model';
import crypto from 'crypto';

/**
 * Role-based Health Portal Registration
 * User selects their role and registers for health portal
 */
export const registerHealthUser = async (req: Request, res: Response) => {
    try {
        const { globalDID, role, personalInfo } = req.body;

        if (!globalDID || !role) {
            return res.status(400).json({
                success: false,
                message: 'globalDID and role are required'
            });
        }

        // Verify DID exists
        const didRecord = await DIDModel.findOne({ did: globalDID });
        if (!didRecord) {
            return res.status(404).json({
                success: false,
                message: 'DID not found. Please enroll first.'
            });
        }

        // Generate pairwise DID for health service
        const pairwiseDID = generatePairwiseDID(globalDID, 'healthcare');

        // Check if already registered
        const existing = await HealthUserModel.findOne({ did: globalDID });
        if (existing) {
            return res.status(200).json({
                success: true,
                message: 'Already registered',
                healthUser: existing
            });
        }

        // Fetch personal info from UserProfile if not provided
        let finalPersonalInfo = personalInfo || {};
        if (!finalPersonalInfo.name) {
            const userProfile = await UserProfileModel.findOne({ did: globalDID });
            if (userProfile && userProfile.personalInfo) {
                finalPersonalInfo = {
                    name: `${userProfile.personalInfo.firstName} ${userProfile.personalInfo.lastName}`,
                    email: userProfile.personalInfo.email,
                    phone: userProfile.personalInfo.phone,
                    gender: userProfile.personalInfo.gender,
                    dob: userProfile.personalInfo.dateOfBirth
                };
            }
        }

        // Set permissions based on role
        const permissions = getRolePermissions(role);

        // Create health user
        const healthUser = await HealthUserModel.create({
            did: globalDID,
            pairwiseDID,
            role,
            personalInfo: finalPersonalInfo,
            permissions,
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'Health portal registration successful',
            healthUser
        });
    } catch (error: any) {
        console.error('Health registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register for health portal'
        });
    }
};

/**
 * Health Portal Login
 * Authenticates user and returns their health profile
 */
export const healthLogin = async (req: Request, res: Response) => {
    try {
        const { globalDID } = req.body;

        if (!globalDID) {
            return res.status(400).json({
                success: false,
                message: 'globalDID is required'
            });
        }

        // Find health user
        const healthUser = await HealthUserModel.findOne({ did: globalDID, isActive: true });

        if (!healthUser) {
            return res.status(404).json({
                success: false,
                message: 'Not registered for health portal',
                needsRegistration: true
            });
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            healthUser: {
                pairwiseDID: healthUser.pairwiseDID,
                role: healthUser.role,
                personalInfo: healthUser.personalInfo,
                permissions: healthUser.permissions
            }
        });
    } catch (error: any) {
        console.error('Health login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
};

/**
 * Get Health Data based on role
 */
export const getHealthData = async (req: Request, res: Response) => {
    try {
        const { globalDID, pairwiseDID } = req.body;

        if (!globalDID || !pairwiseDID) {
            return res.status(400).json({
                success: false,
                message: 'globalDID and pairwiseDID are required'
            });
        }

        const healthUser = await HealthUserModel.findOne({ pairwiseDID });

        if (!healthUser) {
            return res.status(404).json({
                success: false,
                message: 'Health user not found'
            });
        }

        // Fetch health records based on role
        let records: any[] = [];
        let stats = {};

        if (healthUser.role === 'doctor' || healthUser.role === 'healthcare_provider') {
            // Doctors can see all recent records (last 50)
            records = await HealthRecordModel.find({})
                .sort({ timestamp: -1 })
                .lean();

            // Mask anonymous records if verified by someone else? No context yet.
            // For now, if isAnonymous is true, we should maybe mask the patient DID?
            // But doctors verify records, so maybe they need to see it?
            // Let's assume doctors see everything for now for verification purposes.

            const totalPatients = await HealthRecordModel.distinct('did').then(dids => dids.length);
            const totalRecords = await HealthRecordModel.countDocuments();

            stats = { totalPatients, totalRecords, role: healthUser.role };

        } else if (healthUser.role === 'patient' || healthUser.role === 'citizen') {
            // Patients see only their own records
            records = await HealthRecordModel.find({ did: globalDID })
                .sort({ timestamp: -1 })
                .lean();

            const recordTypes = await HealthRecordModel.aggregate([
                { $match: { did: globalDID } },
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ]);

            stats = {
                totalRecords: records.length,
                recordTypes: recordTypes.reduce((acc: any, curr: any) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}),
                role: healthUser.role
            };

        } else if (healthUser.role === 'admin' || healthUser.role === 'government' || healthUser.role === 'policy_maker') {
            // Admins/Government see aggregated analytics or all records anonymized if needed
            // If isAnonymous is true, we remove PII from the record before sending
            const allRecords = await HealthRecordModel.find({})
                .sort({ timestamp: -1 })
                .limit(200)
                .lean();

            records = allRecords.map(r => {
                if (r.isAnonymous) {
                    return { ...r, did: 'ANONYMOUS', pairwiseDID: 'HIDDEN', title: 'Hidden Record' }; // Mask PII
                }
                return r;
            });

            const totalRecords = await HealthRecordModel.countDocuments();
            const totalUsers = await HealthUserModel.countDocuments();
            const recordsByType = await HealthRecordModel.aggregate([
                { $group: { _id: '$type', count: { $sum: 1 } } }
            ]);

            // Verification stats
            const verificationStats = await HealthRecordModel.aggregate([
                { $group: { _id: '$verificationStatus', count: { $sum: 1 } } }
            ]);

            stats = {
                totalRecords,
                totalUsers,
                recordsByType: recordsByType.reduce((acc: any, curr: any) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}),
                verificationStats: verificationStats.reduce((acc: any, curr: any) => {
                    acc[curr._id] = curr.count;
                    return acc;
                }, {}),
                role: healthUser.role
            };

        } else {
            records = [];
        }

        res.status(200).json({
            success: true,
            data: {
                role: healthUser.role,
                records: records,
                recordCount: records.length,
                stats,
                personalInfo: healthUser.personalInfo
            }
        });
    } catch (error: any) {
        console.error('Get health data error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch health data'
        });
    }
};

/**
 * Add Health Record (Doctor OR Citizen/Patient)
 */
export const addHealthRecord = async (req: Request, res: Response) => {
    try {
        const { pairwiseDID, patientDID, type, title, doctor, hospital, date, description, data, isAnonymous } = req.body;

        if (!pairwiseDID) {
            return res.status(400).json({ success: false, message: 'pairwiseDID is required' });
        }

        const healthUser = await HealthUserModel.findOne({ pairwiseDID });
        if (!healthUser) {
            return res.status(404).json({ success: false, message: 'Not authorized' });
        }

        let recordData: any = {
            type,
            title,
            date: date || new Date().toISOString().split('T')[0],
            description,
            data: data || {},
            timestamp: new Date(),
            isAnonymous: !!isAnonymous
        };

        if (healthUser.role === 'citizen' || healthUser.role === 'patient') {
            // Citizen adding their own record
            recordData.did = healthUser.did; // Must be their own DID
            recordData.pairwiseDID = pairwiseDID;
            recordData.doctor = doctor || 'Self-Reported';
            recordData.hospital = hospital || 'N/A';
            recordData.verificationStatus = 'Pending'; // Needs doctor verification
        } else if (['doctor', 'healthcare_provider', 'admin'].includes(healthUser.role)) {
            // Doctor adding record for a patient
            if (!patientDID) {
                return res.status(400).json({ success: false, message: 'patientDID is required for doctors' });
            }
            recordData.did = patientDID;
            recordData.pairwiseDID = pairwiseDID; // Doctor's DID adding it ?? Or should it be patient's? Usually patient's pairwise.
            // Implication: Doctor adds record linked to PATIENT ID.
            recordData.doctor = doctor || healthUser.personalInfo.name || 'Unknown';
            recordData.hospital = hospital || healthUser.personalInfo.organization || 'Unknown';
            recordData.verificationStatus = 'Verified'; // Auto-verified if added by doctor
            recordData.verifiedBy = healthUser.did;
            recordData.verifiedAt = new Date();
        } else {
            return res.status(403).json({ success: false, message: 'Insufficient permissions' });
        }

        const record = await HealthRecordModel.create(recordData);

        res.status(201).json({
            success: true,
            message: 'Health record added successfully',
            record
        });
    } catch (error: any) {
        console.error('Add health record error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add health record'
        });
    }
};

/**
 * Verify a health record (Doctor only)
 */
export const verifyHealthRecord = async (req: Request, res: Response) => {
    try {
        const { recordId, verifierDID, status } = req.body;

        if (!recordId || !verifierDID || !status) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }

        // Check if verifier is a doctor
        const doctor = await HealthUserModel.findOne({ did: verifierDID, role: 'doctor' });
        if (!doctor) {
            return res.status(403).json({ success: false, message: 'Only doctors can verify records' });
        }

        const record = await HealthRecordModel.findById(recordId);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        record.verificationStatus = status; // 'Verified' or 'Rejected'
        record.verifiedBy = verifierDID;
        record.verifiedAt = new Date();

        await record.save();

        res.status(200).json({
            success: true,
            message: `Record ${status.toLowerCase()} successfully`,
            record
        });

    } catch (error: any) {
        console.error('Verify error:', error);
        res.status(500).json({ success: false, message: 'Verification failed' });
    }
}

/**
 * Delete a health record
 */
export const deleteHealthRecord = async (req: Request, res: Response) => {
    try {
        const { recordId, did } = req.body; // did is the requestor

        const record = await HealthRecordModel.findById(recordId);
        if (!record) {
            return res.status(404).json({ success: false, message: 'Record not found' });
        }

        // Check ownership or admin
        if (record.did !== did) {
            return res.status(403).json({ success: false, message: 'You can only delete your own records' });
        }

        await HealthRecordModel.findByIdAndDelete(recordId);

        res.status(200).json({
            success: true,
            message: 'Record deleted successfully'
        });

    } catch (error: any) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, message: 'Delete failed' });
    }
}

/**
 * Get User Role and Permissions
 */
export const getUserRole = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;

        const healthUser = await HealthUserModel.findOne({ did });

        if (!healthUser) {
            return res.status(404).json({
                success: false,
                message: 'Not registered',
                needsRegistration: true
            });
        }

        res.status(200).json({
            success: true,
            role: healthUser.role,
            permissions: healthUser.permissions,
            personalInfo: healthUser.personalInfo
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to get user role'
        });
    }
};

// Helper Functions

function generatePairwiseDID(masterDID: string, service: string): string {
    const hash = crypto
        .createHash('sha256')
        .update(`${masterDID}:${service}:${Date.now()}`)
        .digest('hex');
    return `did:praman:health:${hash.substring(0, 32)}`;
}

function getRolePermissions(role: string): string[] {
    const permissionsMap: Record<string, string[]> = {
        citizen: ['view_own_records', 'update_profile', 'add_own_records'],
        patient: ['view_own_records', 'update_profile', 'share_records', 'add_own_records'],
        doctor: ['view_own_records', 'view_patient_records', 'add_records', 'prescribe', 'verify_records'],
        healthcare_provider: ['view_all_records', 'add_records', 'manage_patients'],
        policy_maker: ['view_analytics', 'view_aggregated_data'],
        government: ['view_analytics', 'view_aggregated_data', 'audit_access'],
        admin: ['full_access', 'manage_users', 'view_all_records', 'system_config']
    };

    return permissionsMap[role] || ['view_own_records'];
}

export default {
    registerHealthUser,
    healthLogin,
    getHealthData,
    addHealthRecord,
    getUserRole,
    verifyHealthRecord,
    deleteHealthRecord
};
