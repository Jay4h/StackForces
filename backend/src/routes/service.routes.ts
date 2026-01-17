import express from 'express';
import {
    generateServiceChallenge,
    authorizeService,
    getConsentHistory,
    updateProfile
} from '../controllers/service.controller';

const router = express.Router();

// Phase 2 Routes

/**
 * POST /api/service/challenge
 * Generate authentication challenge for service login
 */
router.post('/challenge', generateServiceChallenge);

/**
 * POST /api/service/authorize
 * Verify biometrics, generate pairwise DID, return filtered data
 */
router.post('/authorize', authorizeService);

/**
 * GET /api/service/consent-history/:did
 * Get user's consent and data sharing history
 */
router.get('/consent-history/:did', getConsentHistory);

/**
 * PUT /api/service/profile/:did
 * Update user profile (demo purposes)
 */
router.put('/profile/:did', updateProfile);

export default router;
