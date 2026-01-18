/**
 * ========================================
 * CENTRALIZED ERROR HANDLER
 * ========================================
 * Production-grade error handling with:
 * - Custom error classes
 * - HTTP status code mapping
 * - PII redaction in error messages
 * - Detailed logging
 * ========================================
 */

import { Request, Response, NextFunction } from 'express';
import { logger, logAuditEvent } from '../utils/logger';

/**
 * Base application error class
 */
export class AppError extends Error {
    public statusCode: number;
    public code: string;
    public isOperational: boolean;

    constructor(message: string, statusCode: number, code: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Specific error classes
 */
export class ValidationError extends AppError {
    constructor(message: string, field?: string) {
        super(message, 400, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Authentication failed') {
        super(message, 401, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Resource already exists') {
        super(message, 409, 'CONFLICT');
        this.name = 'ConflictError';
    }
}

export class RateLimitError extends AppError {
    constructor(retryAfter: number = 300) {
        super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
        this.name = 'RateLimitError';
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = 'Internal server error') {
        super(message, 500, 'INTERNAL_ERROR');
        this.name = 'InternalServerError';
    }
}

export class DatabaseError extends AppError {
    constructor(message: string = 'Database operation failed') {
        super(message, 500, 'DATABASE_ERROR');
        this.name = 'DatabaseError';
    }
}

export class WebAuthnError extends AppError {
    constructor(message: string) {
        super(message, 400, 'WEBAUTHN_ERROR');
        this.name = 'WebAuthnError';
    }
}

export class DIDError extends AppError {
    constructor(message: string) {
        super(message, 400, 'DID_ERROR');
        this.name = 'DIDError';
    }
}

/**
 * Async handler wrapper
 * Catches async errors and passes to error middleware
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Global error handling middleware
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const IS_PRODUCTION = process.env.NODE_ENV === 'production';

    // Default error values
    let statusCode = 500;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let stack = undefined;

    // Handle AppError instances
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        code = err.code;
    }

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        code = 'VALIDATION_ERROR';
        message = Object.values((err as any).errors)
            .map((e: any) => e.message)
            .join(', ');
    }

    // Handle Mongoose duplicate key errors
    if ((err as any).code === 11000) {
        statusCode = 409;
        code = 'DUPLICATE_KEY';
        message = 'Resource already exists';
    }

    // Handle Mongoose cast errors
    if (err.name === 'CastError') {
        statusCode = 400;
        code = 'INVALID_ID';
        message = 'Invalid ID format';
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        code = 'INVALID_TOKEN';
        message = 'Invalid authentication token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        code = 'TOKEN_EXPIRED';
        message = 'Authentication token expired';
    }

    // Log error
    const logLevel = statusCode >= 500 ? 'error' : 'warn';
    logger[logLevel]('Error occurred', {
        error: err.message,
        code,
        statusCode,
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        stack: IS_PRODUCTION ? undefined : err.stack,
    });

    // Audit log for security-critical errors
    if (statusCode === 401 || statusCode === 403) {
        logAuditEvent({
            action: 'SECURITY_ERROR',
            actor: req.ip || 'unknown',
            resource: req.path,
            details: { code, message },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });
    }

    // Send response
    res.status(statusCode).json({
        success: false,
        message: IS_PRODUCTION ? getGenericErrorMessage(statusCode) : message,
        code,
        ...(IS_PRODUCTION ? {} : { stack: err.stack }),
    });
};

/**
 * Get generic error message for production
 * (Avoid leaking implementation details)
 */
function getGenericErrorMessage(statusCode: number): string {
    switch (statusCode) {
        case 400:
            return 'Invalid request';
        case 401:
            return 'Authentication required';
        case 403:
            return 'Access denied';
        case 404:
            return 'Resource not found';
        case 409:
            return 'Resource conflict';
        case 429:
            return 'Too many requests';
        case 500:
        default:
            return 'Internal server error';
    }
}

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
    logger.warn('Route not found', {
        method: req.method,
        path: req.path,
        ip: req.ip,
    });

    res.status(404).json({
        success: false,
        message: 'Route not found',
        code: 'ROUTE_NOT_FOUND',
    });
};

export default errorHandler;
