import express from 'express';
import {
    createOrUpdateProfile,
    getProfile,
    updatePersonalInfo,
    updateAddress,
    updateGovernmentIds,
    updateEmergencyContact,
    updatePreferences,
    deleteProfileField
} from '../controllers/profile.controller';

const router = express.Router();

// Core Profile Operations
router.post('/update', createOrUpdateProfile);
router.get('/:did', getProfile);

// Specific Section Updates
router.patch('/:did/personal', updatePersonalInfo);
router.patch('/:did/address', updateAddress);
router.patch('/:did/government-ids', updateGovernmentIds);
router.patch('/:did/emergency-contact', updateEmergencyContact);
router.patch('/:did/preferences', updatePreferences);

// Field Deletion
router.post('/:did/delete-field', deleteProfileField);

export default router;
