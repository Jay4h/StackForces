/**
 * ========================================
 * DID AUTHENTICATION MIDDLEWARE
 * ========================================
 * Enforces: Every API request must include
 * a DID or proof derived from it
 * ========================================
 */

import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

const DID_REGISTRY_URL = process.env.DID_REGISTRY_URL || 'http://localhost:3001';

// Extend Express Request to include DID info
declare global {
    namespace Express {
        interface Request {
            did?: string;
            pairwiseDID?: string;
            actorType?: string;
            verified?: boolean;
        }
    }
}

/**
 * DID Authentication Middleware
 * Validates that request includes valid DID
 */
export const requireDID = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Check for DID in headers
        const did = req.headers['x-did'] as string;
        const pairwiseDID = req.headers['x-pairwise-did'] as string;

        // Check for DID in body (for POST requests)
        const bodyDID = req.body?.did || req.body?.holderDID || req.body?.presentation?.holder;

        const actualDID = did || bodyDID;

        if (!actualDID) {
            res.status(401).json({
                error: 'Authentication required',
                message: 'Request must include X-DID header or DID in body',
                code: 'MISSING_DID',
            });
            return;
        }

        // Validate DID format
        if (!actualDID.startsWith('did:praman:')) {
            res.status(400).json({
                error: 'Invalid DID format',
                message: 'DID must start with did:praman:',
                code: 'INVALID_DID_FORMAT',
            });
            return;
        }

        // Resolve DID from registry to verify it exists
        try {
            const didResolution = await axios.get(`${DID_REGISTRY_URL}/dids/${actualDID}`);

            if (didResolution.data.deactivated) {
                res.status(403).json({
                    error: 'DID deactivated',
                    message: 'This DID has been deactivated',
                    code: 'DID_DEACTIVATED',
                });
                return;
            }

            // Attach DID info to request
            req.did = actualDID;
            req.pairwiseDID = pairwiseDID;
            req.verified = true;

            next();
        } catch (error: any) {
            if (error.response?.status === 404) {
                res.status(404).json({
                    error: 'DID not found',
                    message: 'DID does not exist in registry',
                    code: 'DID_NOT_FOUND',
                });
            } else {
                res.status(503).json({
                    error: 'DID resolution failed',
                    message: 'Unable to verify DID',
                    code: 'DID_RESOLUTION_ERROR',
                });
            }
        }
    } catch (error: any) {
        res.status(500).json({
            error: 'Authentication error',
            message: error.message,
        });
    }
};

/**
 * Require Verifiable Presentation
 * For high-security endpoints
 */
export const requirePresentation = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { presentation } = req.body;

        if (!presentation) {
            res.status(401).json({
                error: 'Presentation required',
                message: 'This endpoint requires a Verifiable Presentation',
                code: 'MISSING_PRESENTATION',
            });
            return;
        }

        // Validate presentation structure
        if (!presentation.holder || !presentation.verifiableCredential || !presentation.proof) {
            res.status(400).json({
                error: 'Invalid presentation',
                message: 'Presentation must have holder, verifiableCredential, and proof',
                code: 'INVALID_PRESENTATION',
            });
            return;
        }

        // Verify presentation (call verifier service)
        const VERIFIER_URL = process.env.VERIFIER_SERVICE_URL || 'http://localhost:3003';

        try {
            const verificationResult = await axios.post(`${VERIFIER_URL}/verify/presentation`, {
                presentation,
            });

            if (!verificationResult.data.verified) {
                res.status(403).json({
                    error: 'Presentation verification failed',
                    message: 'The presentation could not be verified',
                    code: 'INVALID_PRESENTATION_PROOF',
                });
                return;
            }

            // Attach presentation info to request
            req.did = presentation.holder;
            req.verified = true;

            next();
        } catch (error: any) {
            res.status(403).json({
                error: 'Presentation verification failed',
                message: error.response?.data?.message || 'Verification service error',
            });
        }
    } catch (error: any) {
        res.status(500).json({
            error: 'Presentation validation error',
            message: error.message,
        });
    }
};

/**
 * Require specific actor type
 * E.g., only doctors can access certain endpoints
 */
export const requireActorType = (allowedTypes: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const did = req.did;

            if (!did) {
                res.status(401).json({
                    error: 'Authentication required',
                    message: 'DID must be verified first',
                });
                return;
            }

            // Determine actor type from DID format
            let actorType = 'unknown';

            if (did.includes(':doctor:')) {
                actorType = 'Doctor';
            } else if (did.includes(':org:') || did.includes(':hospital:')) {
                actorType = 'Hospital';
            } else if (did.includes(':lab:')) {
                actorType = 'Lab';
            } else if (did.includes(':insurer:')) {
                actorType = 'Insurer';
            } else if (did.includes(':gov:')) {
                actorType = 'Government';
            } else if (did.includes(':pairwise:')) {
                actorType = 'Patient'; // Pairwise DID implies patient
            } else {
                actorType = 'Patient'; // Default to patient
            }

            req.actorType = actorType;

            if (!allowedTypes.includes(actorType)) {
                res.status(403).json({
                    error: 'Insufficient permissions',
                    message: `This endpoint requires actor type: ${allowedTypes.join(' or ')}`,
                    yourType: actorType,
                    code: 'WRONG_ACTOR_TYPE',
                });
                return;
            }

            next();
        } catch (error: any) {
            res.status(500).json({
                error: 'Actor type validation error',
                message: error.message,
            });
        }
    };
};

/**
 * Optional: Extract DID if present, don't fail if missing
 */
export const extractDID = (req: Request, res: Response, next: NextFunction): void => {
    const did = req.headers['x-did'] as string || req.body?.did;
    const pairwiseDID = req.headers['x-pairwise-did'] as string;

    if (did) {
        req.did = did;
        req.pairwiseDID = pairwiseDID;
    }

    next();
};

export default {
    requireDID,
    requirePresentation,
    requireActorType,
    extractDID,
};
