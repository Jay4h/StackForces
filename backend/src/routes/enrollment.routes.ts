import { Router } from 'express';
import { startEnrollment, verifyEnrollment } from '../controllers/enrollment.controller';

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

export default router;
