/**
 * ========================================
 * PRODUCTION HEALTH PORTAL CONTROLLER
 * ========================================
 * Implements:
 * - C++ crypto bridge for DID operations
 * - Redis Kill Switch integration
 * - Audit logging
 * - PII encryption at rest
 * - Error handling
 * ========================================
 */

import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { HealthRecordModel } from '../models/healthRecord.model';
import { AccessLogModel } from '../models/accessLog.model';
import { generatePairwiseDID } from '../services/cpp-bridge';
import { revokePairwiseDID, restorePairwiseDID, getRevocationStatus } from '../middleware/revocation.middleware';
import { logger, logAuditEvent } from '../utils/logger';
import {
    asyncHandler,
    ValidationError,
    NotFoundError,
    AuthorizationError
} from '../middleware/errorHandler.middleware';

/**
 * Step 1: Health Portal Login
 * Generates pairwise DID for service-specific identity
 */
export const healthLogin = asyncHandler(async (req: Request, res: Response) => {
    const { globalDID } = req.body;

    if (!globalDID) {
        throw new ValidationError('globalDID is required');
    }

    // Find user by global DID
    const user = await UserModel.findOne({ masterDID: globalDID });
    if (!user) {
        throw new NotFoundError('User');
    }

    // Generate or retrieve pairwise DID for health service
    const pairwiseDID = user.getPairwiseDID('healthcare');

    // Save if new pairwise DID was created
    if (user.isModified('pairwiseDIDs')) {
        await user.save();
    }

    // Check revocation status
    const revocationStatus = await getRevocationStatus(pairwiseDID);
    if (revocationStatus.revoked) {
        logAuditEvent({
            action: 'HEALTH_LOGIN_DENIED_REVOKED',
            actor: globalDID,
            resource: 'healthcare',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        throw new AuthorizationError('Access has been revoked');
    }

    // Log successful login
    await AccessLogModel.create({
        did: globalDID,
        pairwiseDID,
        service: 'Health Portal',
        action: 'Login / Identity Handshake',
        status: 'Approved',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        timestamp: new Date(),
    });

    logAuditEvent({
        action: 'HEALTH_LOGIN_SUCCESS',
        actor: globalDID,
        resource: 'healthcare',
        details: { pairwiseDID: pairwiseDID.substring(0, 20) + '...' },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
    });

    logger.info('Health portal login successful', {
        globalDID: globalDID.substring(0, 20) + '...',
        pairwiseDID: pairwiseDID.substring(0, 20) + '...',
    });

    res.status(200).json({
        success: true,
        pairwiseDID,
        message: 'Identity handshake successful',
    });
});

/**
 * Step 2: Get Health Data (Selective Disclosure)
 * Returns only requested fields from user's health records
 */
export const getHealthData = asyncHandler(async (req: Request, res: Response) => {
    const { globalDID, pairwiseDID, requestedFields } = req.body;

    if (!globalDID || !pairwiseDID) {
        throw new ValidationError('globalDID and pairwiseDID are required');
    }

    // Check revocation (redundant with middleware, but good for defense-in-depth)
    const revocationStatus = await getRevocationStatus(pairwiseDID);
    if (revocationStatus.revoked) {
        throw new AuthorizationError('Access has been revoked');
    }

    // Fetch user data (PII will be auto-decrypted by Mongoose middleware)
    const user = await UserModel.findOne({ masterDID: globalDID });
    if (!user) {
        throw new NotFoundError('User');
    }

    // Fetch health records
    const healthRecords = await HealthRecordModel.find({
        did: globalDID,
        pairwiseDID,
    }).sort({ date: -1 });

    // Selective disclosure: Only return requested fields
    const disclosedData: any = {};

    if (!requestedFields || requestedFields.length === 0) {
        // If no specific fields requested, return basic profile
        disclosedData.name = user.personalInfo.name;
    } else {
        // Return only requested fields
        const allowedFields = ['name', 'email', 'phone', 'address', 'dateOfBirth'];

        requestedFields.forEach((field: string) => {
            if (allowedFields.includes(field) && user.personalInfo[field as keyof typeof user.personalInfo]) {
                disclosedData[field] = user.personalInfo[field as keyof typeof user.personalInfo];
            }
        });
    }

    // Add health records
    disclosedData.records = healthRecords;
    disclosedData.recordCount = healthRecords.length;

    // Log data access
    await AccessLogModel.create({
        did: globalDID,
        pairwiseDID,
        service: 'Health Portal',
        action: `Data Access: ${(requestedFields || ['basic']).join(', ')}`,
        status: 'Approved',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        timestamp: new Date(),
    });

    logAuditEvent({
        action: 'HEALTH_DATA_ACCESSED',
        actor: pairwiseDID,
        resource: 'health_records',
        details: {
            fieldsAccessed: requestedFields || ['basic'],
            recordCount: healthRecords.length,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
    });

    logger.info('Health data accessed', {
        globalDID: globalDID.substring(0, 20) + '...',
        fieldsAccessed: requestedFields || ['basic'],
        recordCount: healthRecords.length,
    });

    res.status(200).json({
        success: true,
        data: disclosedData,
    });
});

/**
 * Step 3: Add Health Record
 * Hospital/doctor adds a new health record
 */
export const addHealthRecord = asyncHandler(async (req: Request, res: Response) => {
    const {
        globalDID,
        pairwiseDID,
        type,
        title,
        doctor,
        hospital,
        date,
        description,
        data,
    } = req.body;

    if (!globalDID || !pairwiseDID || !type || !title || !doctor || !hospital || !date) {
        throw new ValidationError('Missing required fields');
    }

    // Check revocation
    const revocationStatus = await getRevocationStatus(pairwiseDID);
    if (revocationStatus.revoked) {
        throw new AuthorizationError('Access has been revoked');
    }

    // Verify user exists
    const user = await UserModel.findOne({ masterDID: globalDID });
    if (!user) {
        throw new NotFoundError('User');
    }

    // Create health record
    const newRecord = await HealthRecordModel.create({
        did: globalDID,
        pairwiseDID,
        type,
        title,
        doctor,
        hospital,
        date,
        description,
        data: data || {},
        timestamp: new Date(),
    });

    // Log record creation
    await AccessLogModel.create({
        did: globalDID,
        pairwiseDID,
        service: 'Health Portal',
        action: `Added Record: ${title}`,
        status: 'Approved',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        timestamp: new Date(),
    });

    logAuditEvent({
        action: 'HEALTH_RECORD_ADDED',
        actor: pairwiseDID,
        resource: newRecord._id.toString(),
        details: { type, title, hospital },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
    });

    logger.info('Health record added', {
        globalDID: globalDID.substring(0, 20) + '...',
        recordType: type,
        hospital,
    });

    res.status(201).json({
        success: true,
        message: 'Health record added successfully',
        record: newRecord,
    });
});

/**
 * Step 4: Revoke Health Portal Access
 * User revokes access to health portal (Kill Switch)
 */
export const revokeHealthAccess = asyncHandler(async (req: Request, res: Response) => {
    const { globalDID, pairwiseDID, reason } = req.body;

    if (!globalDID || !pairwiseDID) {
        throw new ValidationError('globalDID and pairwiseDID are required');
    }

    // Verify user exists
    const user = await UserModel.findOne({ masterDID: globalDID });
    if (!user) {
        throw new NotFoundError('User');
    }

    // Revoke access in Redis
    await revokePairwiseDID(pairwiseDID, reason || 'User requested revocation');

    // Log revocation
    await AccessLogModel.create({
        did: globalDID,
        pairwiseDID,
        service: 'Health Portal',
        action: 'Revoked Access',
        status: 'Revoked',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        timestamp: new Date(),
    });

    logAuditEvent({
        action: 'HEALTH_ACCESS_REVOKED',
        actor: globalDID,
        resource: pairwiseDID,
        details: { reason },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
    });

    logger.warn('Health portal access revoked', {
        globalDID: globalDID.substring(0, 20) + '...',
        pairwiseDID: pairwiseDID.substring(0, 20) + '...',
        reason,
    });

    res.status(200).json({
        success: true,
        message: 'Health portal access revoked successfully',
    });
});

/**
 * Step 5: Restore Health Portal Access
 * User restores previously revoked access
 */
export const restoreHealthAccess = asyncHandler(async (req: Request, res: Response) => {
    const { globalDID, pairwiseDID } = req.body;

    if (!globalDID || !pairwiseDID) {
        throw new ValidationError('globalDID and pairwiseDID are required');
    }

    // Verify user exists
    const user = await UserModel.findOne({ masterDID: globalDID });
    if (!user) {
        throw new NotFoundError('User');
    }

    // Restore access in Redis
    await restorePairwiseDID(pairwiseDID);

    // Log restoration
    await AccessLogModel.create({
        did: globalDID,
        pairwiseDID,
        service: 'Health Portal',
        action: 'Restored Access',
        status: 'Approved',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        timestamp: new Date(),
    });

    logAuditEvent({
        action: 'HEALTH_ACCESS_RESTORED',
        actor: globalDID,
        resource: pairwiseDID,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
    });

    logger.info('Health portal access restored', {
        globalDID: globalDID.substring(0, 20) + '...',
        pairwiseDID: pairwiseDID.substring(0, 20) + '...',
    });

    res.status(200).json({
        success: true,
        message: 'Health portal access restored successfully',
    });
});

/**
 * Get all access logs for a user
 */
export const getAccessLogs = asyncHandler(async (req: Request, res: Response) => {
    const { globalDID } = req.query;

    if (!globalDID) {
        throw new ValidationError('globalDID is required');
    }

    const logs = await AccessLogModel.find({ did: globalDID as string })
        .sort({ timestamp: -1 })
        .limit(100);

    res.status(200).json({
        success: true,
        count: logs.length,
        logs,
    });
});

export default {
    healthLogin,
    getHealthData,
    addHealthRecord,
    revokeHealthAccess,
    restoreHealthAccess,
    getAccessLogs,
};
