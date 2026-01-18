/**
 * ========================================
 * PRODUCTION LOGGING SYSTEM
 * ========================================
 * Winston-based logger with:
 * - PII redaction for GDPR compliance
 * - Daily log rotation
 * - Multiple transports (file + console)
 * - Structured JSON logging
 * - Different log levels per environment
 * ========================================
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const LOG_LEVEL = process.env.LOG_LEVEL || (IS_PRODUCTION ? 'info' : 'debug');
const ENABLE_PII_REDACTION = process.env.ENABLE_PII_REDACTION === 'true';

/**
 * PII Redaction - Remove sensitive data from logs
 */
const redactPII = winston.format((info) => {
    if (!ENABLE_PII_REDACTION) return info;

    const sensitiveFields = [
        'password',
        'credential',
        'credentialPublicKey',
        'credentialID',
        'authenticatorData',
        'clientDataJSON',
        'signature',
        'publicKey',
        'privateKey',
        'aadhar',
        'pan',
        'phone',
        'email',
        'address',
    ];

    // Recursively redact sensitive fields
    const redactObject = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;

        for (const key in obj) {
            if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                obj[key] = '[REDACTED]';
            } else if (typeof obj[key] === 'object') {
                obj[key] = redactObject(obj[key]);
            }
        }
        return obj;
    };

    return redactObject(info);
});

/**
 * Console format for development (human-readable)
 */
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    redactPII(),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info;
        const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
        return `${timestamp} [${level.toUpperCase()}]: ${message}${metaString}`;
    })
);

/**
 * JSON format for production (machine-readable)
 */
const jsonFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    redactPII(),
    winston.format.json()
);

/**
 * File rotation transport for production
 */
const fileRotateTransport = new DailyRotateFile({
    filename: process.env.LOG_FILE_PATH || 'logs/praman-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m', // Rotate when log file reaches 20MB
    maxFiles: '14d', // Keep logs for 14 days
    format: jsonFormat,
    level: LOG_LEVEL,
});

/**
 * Error-only file transport
 */
const errorFileTransport = new DailyRotateFile({
    filename: process.env.LOG_FILE_PATH?.replace('.log', '-error.log') || 'logs/praman-error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d', // Keep error logs longer (30 days)
    format: jsonFormat,
    level: 'error',
});

/**
 * Console transport
 */
const consoleTransport = new winston.transports.Console({
    format: IS_PRODUCTION ? jsonFormat : consoleFormat,
    level: LOG_LEVEL,
});

/**
 * Create Winston logger instance
 */
export const logger = winston.createLogger({
    level: LOG_LEVEL,
    defaultMeta: {
        service: 'praman-api',
        environment: process.env.NODE_ENV,
    },
    transports: [
        consoleTransport,
        ...(IS_PRODUCTION ? [fileRotateTransport, errorFileTransport] : []),
    ],
    exitOnError: false,
});

/**
 * Audit logger for security-critical events
 * (e.g., DID creation, access grants/revocations)
 */
export const auditLogger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: {
        service: 'praman-audit',
        environment: process.env.NODE_ENV,
    },
    transports: [
        new DailyRotateFile({
            filename: 'logs/audit-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '50m',
            maxFiles: '365d', // Keep audit logs for 1 year
        }),
    ],
});

/**
 * Log audit event
 */
export const logAuditEvent = (event: {
    action: string;
    actor: string;
    resource?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
}) => {
    if (process.env.ENABLE_AUDIT_LOG === 'true') {
        auditLogger.info('AUDIT_EVENT', {
            ...event,
            timestamp: new Date().toISOString(),
        });
    }
};

/**
 * Morgan stream for HTTP request logging
 */
export const morganStream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

export default logger;
