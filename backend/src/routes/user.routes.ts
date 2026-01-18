import { Router } from 'express';
import {
    getUserProfile,
    updateUserProfile,
    getUserStats,
    updatePassword,
    deleteAccount,
    getUserActivity
} from '../controllers/user.controller';

const router = Router();

// Get user profile by DID
router.get('/profile/:did', getUserProfile);

// Update user profile
router.put('/profile/:did', updateUserProfile);

// Get user statistics
router.get('/stats/:did', getUserStats);

// Update password/security
router.put('/security/:did', updatePassword);

// Get user activity logs
router.get('/activity/:did', getUserActivity);

// Delete account
router.delete('/account/:did', deleteAccount);

export default router;
