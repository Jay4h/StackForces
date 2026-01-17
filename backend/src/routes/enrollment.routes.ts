import { Router } from 'express';
import { startEnrollment, verifyEnrollment, startLogin, verifyLogin } from '../controllers/enrollment.controller';

const router = Router();

/**
 * POST /api/enrollment/start
 * Generate WebAuthn challenge for enrollment
 */
router.post('/start', startEnrollment);

/**
 * POST /api/enrollment/verify
 * Verify credential and create Bharat-ID
 */
router.post('/verify', verifyEnrollment);

/**
 * POST /api/enrollment/login/start
 * Generate authentication challenge for existing users
 */
router.post('/login/start', startLogin);

/**
 * POST /api/enrollment/login/verify
 * Verify authentication and return user's Bharat-ID
 */
router.post('/login/verify', verifyLogin);

export default router;
