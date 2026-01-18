import { Request, Response } from 'express';
import { UserProfileModel } from '../models/userProfile.model';
import { DIDModel } from '../models/did.model';

/**
 * Create or Update Complete User Profile
 */
export const createOrUpdateProfile = async (req: Request, res: Response) => {
    try {
        const { did, personalInfo, address, governmentIds, emergencyContact, preferences } = req.body;

        if (!did) {
            return res.status(400).json({
                success: false,
                message: 'DID is required'
            });
        }

        // Sanitize Input (Fix specific validation errors)
        if (personalInfo && personalInfo.gender === '') {
            delete personalInfo.gender;
        }

        // Verify DID exists
        const didRecord = await DIDModel.findOne({ did });
        if (!didRecord) {
            return res.status(404).json({
                success: false,
                message: 'DID not found. Please enroll first.'
            });
        }

        // Check if profile exists
        let profile = await UserProfileModel.findOne({ did });

        if (profile) {
            // Update existing profile
            if (personalInfo) profile.personalInfo = { ...profile.personalInfo, ...personalInfo };
            if (address) profile.address = { ...profile.address, ...address };
            if (governmentIds) profile.governmentIds = { ...profile.governmentIds, ...governmentIds };
            if (emergencyContact) profile.emergencyContact = { ...profile.emergencyContact, ...emergencyContact };
            if (preferences) profile.preferences = { ...profile.preferences, ...preferences };

            // Check if profile is complete
            profile.isProfileComplete = checkProfileCompletion(profile);

            await profile.save();

            return res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                profile: sanitizeProfile(profile)
            });
        } else {
            // Create new profile
            profile = await UserProfileModel.create({
                did,
                personalInfo: personalInfo || {},
                address: address || {},
                governmentIds: governmentIds || {},
                emergencyContact: emergencyContact || {},
                preferences: preferences || {}
            });

            profile.isProfileComplete = checkProfileCompletion(profile);
            await profile.save();

            return res.status(201).json({
                success: true,
                message: 'Profile created successfully',
                profile: sanitizeProfile(profile)
            });
        }
    } catch (error: any) {
        console.error('Profile create/update error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create/update profile'
        });
    }
};

/**
 * Get User Profile by DID
 */
export const getProfile = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;

        const profile = await UserProfileModel.findOne({ did });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found',
                needsProfile: true
            });
        }

        res.status(200).json({
            success: true,
            profile: sanitizeProfile(profile)
        });
    } catch (error: any) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile'
        });
    }
};

/**
 * Update Personal Information
 */
export const updatePersonalInfo = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;
        const updates = req.body;

        const profile = await UserProfileModel.findOne({ did });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        profile.personalInfo = { ...profile.personalInfo, ...updates };
        profile.isProfileComplete = checkProfileCompletion(profile);
        await profile.save();

        res.status(200).json({
            success: true,
            message: 'Personal information updated',
            profile: sanitizeProfile(profile)
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to update personal information'
        });
    }
};

/**
 * Update Address
 */
export const updateAddress = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;
        const updates = req.body;

        const profile = await UserProfileModel.findOne({ did });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        profile.address = { ...profile.address, ...updates };
        await profile.save();

        res.status(200).json({
            success: true,
            message: 'Address updated',
            profile: sanitizeProfile(profile)
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to update address'
        });
    }
};

/**
 * Update Government IDs
 */
export const updateGovernmentIds = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;
        const updates = req.body;

        const profile = await UserProfileModel.findOne({ did });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        profile.governmentIds = { ...profile.governmentIds, ...updates };
        await profile.save();

        res.status(200).json({
            success: true,
            message: 'Government IDs updated',
            profile: sanitizeProfile(profile)
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to update government IDs'
        });
    }
};

/**
 * Update Emergency Contact
 */
export const updateEmergencyContact = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;
        const updates = req.body;

        const profile = await UserProfileModel.findOne({ did });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        profile.emergencyContact = { ...profile.emergencyContact, ...updates };
        await profile.save();

        res.status(200).json({
            success: true,
            message: 'Emergency contact updated',
            profile: sanitizeProfile(profile)
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to update emergency contact'
        });
    }
};

/**
 * Update Preferences
 */
export const updatePreferences = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;
        const updates = req.body;

        const profile = await UserProfileModel.findOne({ did });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        profile.preferences = { ...profile.preferences, ...updates };
        await profile.save();

        res.status(200).json({
            success: true,
            message: 'Preferences updated',
            profile: sanitizeProfile(profile)
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to update preferences'
        });
    }
};

/**
 * Delete specific data field
 */
export const deleteProfileField = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;
        const { section, field } = req.body;

        const profile = await UserProfileModel.findOne({ did });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // Delete specific field based on section
        if (section === 'governmentIds' && profile.governmentIds) {
            (profile.governmentIds as any)[field] = undefined;
        } else if (section === 'emergencyContact') {
            profile.emergencyContact = undefined;
        }

        await profile.save();

        res.status(200).json({
            success: true,
            message: 'Field deleted successfully',
            profile: sanitizeProfile(profile)
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete field'
        });
    }
};

// Helper Functions

function checkProfileCompletion(profile: any): boolean {
    const hasPersonalInfo = profile.personalInfo?.firstName &&
        profile.personalInfo?.lastName &&
        profile.personalInfo?.email;

    const hasAddress = profile.address?.city && profile.address?.state;

    return !!(hasPersonalInfo && hasAddress);
}

function sanitizeProfile(profile: any) {
    return {
        did: profile.did,
        personalInfo: profile.personalInfo,
        address: profile.address,
        governmentIds: {
            aadhar: profile.governmentIds?.aadhar ? '****' + profile.governmentIds.aadhar.slice(-4) : undefined,
            pan: profile.governmentIds?.pan,
            passport: profile.governmentIds?.passport ? '****' + profile.governmentIds.passport.slice(-4) : undefined,
            drivingLicense: profile.governmentIds?.drivingLicense
        },
        emergencyContact: profile.emergencyContact,
        preferences: profile.preferences,
        isProfileComplete: profile.isProfileComplete,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
    };
}

export default {
    createOrUpdateProfile,
    getProfile,
    updatePersonalInfo,
    updateAddress,
    updateGovernmentIds,
    updateEmergencyContact,
    updatePreferences,
    deleteProfileField
};
