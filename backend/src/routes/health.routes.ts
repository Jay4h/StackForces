import { Router } from 'express';
import { healthLogin, getHealthData, revokeHealthAccess, addHealthRecord } from '../controllers/health.controller';
import {
    registerHealthUser,
    healthLogin as roleBasedLogin,
    getHealthData as roleBasedGetData,
    addHealthRecord as roleBasedAddRecord,
    getUserRole,
    verifyHealthRecord,
    deleteHealthRecord
} from '../controllers/healthPortal.controller';

const router = Router();

// Original routes (kept for backward compatibility)
router.post('/login', healthLogin);
router.post('/data', getHealthData);
router.post('/record', addHealthRecord);
router.post('/revoke', revokeHealthAccess);

// Role-based routes
router.post('/register', registerHealthUser);
router.post('/role-login', roleBasedLogin);
router.post('/role-data', roleBasedGetData);
router.post('/role-record', roleBasedAddRecord);
router.post('/role-verify', verifyHealthRecord);
router.post('/role-delete', deleteHealthRecord);
router.get('/role/:did', getUserRole);

export default router;
