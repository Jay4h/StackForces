import { Request, Response } from 'express';
import { DIDModel } from '../models/did.model';

/**
 * Get user profile by DID
 */
export const getUserProfile = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;

        const user = await DIDModel.findOne({ did });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            profile: {
                did: user.did,
                publicKey: user.publicKey,
                credentialId: user.credentialId,
                deviceInfo: user.deviceInfo,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                counter: user.counter
            }
        });
    } catch (error: any) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user profile'
        });
    }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;
        const { deviceName, platform } = req.body;

        const user = await DIDModel.findOne({ did });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update device info if provided
        if (deviceName) {
            user.deviceInfo.deviceName = deviceName;
        }
        if (platform) {
            user.deviceInfo.platform = platform;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile: {
                did: user.did,
                deviceInfo: user.deviceInfo
            }
        });
    } catch (error: any) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

/**
 * Get user statistics
 */
export const getUserStats = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;

        const user = await DIDModel.findOne({ did });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Calculate account age in days
        const accountAge = Math.floor(
            (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        res.status(200).json({
            success: true,
            stats: {
                accountAge,
                authCount: user.counter || 0,
                lastActive: user.updatedAt,
                deviceType: user.deviceInfo?.deviceType || 'Unknown',
                createdAt: user.createdAt
            }
        });
    } catch (error: any) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
};

/**
 * Get user activity (placeholder for future implementation)
 */
export const getUserActivity = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;

        const user = await DIDModel.findOne({ did });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Return mock activity for now
        const activities = [
            {
                action: 'Account Created',
                timestamp: user.createdAt,
                success: true,
                ip: 'Hidden for privacy'
            },
            {
                action: 'Profile Accessed',
                timestamp: user.updatedAt,
                success: true,
                ip: 'Hidden for privacy'
            }
        ];

        res.status(200).json({
            success: true,
            activities
        });
    } catch (error: any) {
        console.error('Error fetching activity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity'
        });
    }
};

/**
 * Update password/security settings (placeholder)
 */
export const updatePassword = async (req: Request, res: Response) => {
    try {
        // For biometric auth, we don't have traditional passwords
        // This is a placeholder for future security updates
        res.status(200).json({
            success: true,
            message: 'Security settings are managed through biometric authentication'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to update security settings'
        });
    }
};

/**
 * Delete account
 */
export const deleteAccount = async (req: Request, res: Response) => {
    try {
        const { did } = req.params;

        const result = await DIDModel.deleteOne({ did });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting account:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account'
        });
    }
};

export default {
    getUserProfile,
    updateUserProfile,
    getUserStats,
    getUserActivity,
    updatePassword,
    deleteAccount
};
