import { Router } from 'express';
import { healthLogin, getHealthData, revokeHealthAccess, addHealthRecord } from '../controllers/health.controller';

const router = Router();

router.post('/login', healthLogin);
router.post('/data', getHealthData);
router.post('/record', addHealthRecord);
router.post('/revoke', revokeHealthAccess);

export default router;
