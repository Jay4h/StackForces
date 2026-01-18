import { Router } from 'express';
import { verifyAge, getConsentHistory } from '../controllers/verification.controller';

const router = Router();

// POST /api/verification/age-zkp
router.post('/age-zkp', verifyAge);

// GET /api/verification/history/:did
router.get('/history/:did', getConsentHistory);

export default router;
