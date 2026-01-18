import express from 'express';
import { sendFamilyInvite, getIncomingInvites, respondToInvite, getFamilyMembers } from '../controllers/family.controller';

const router = express.Router();

router.post('/invite', sendFamilyInvite);
router.get('/requests/:did', getIncomingInvites);
router.post('/respond', respondToInvite);
router.get('/members/:did', getFamilyMembers);

export default router;
