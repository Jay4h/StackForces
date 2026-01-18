/**
 * ========================================
 * PRODUCTION RATE LIMITING
 * ========================================
 * Redis-backed rate limiting to prevent:
 * - Brute force attacks on WebAuthn
 * - DDoS attacks
 * - Credential stuffing
 * ========================================
 */

import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import redisClient from '../config/redis';
import { logger } from '../utils/logger';

/**
 * Create Redis-backed rate limiter
 */
const createRedisLimiter = (points: number, duration: number) => {
    if (redisClient && redisClient.isReady) {
        return new RateLimiterRedis({
            storeClient: redisClient,
            points, // Number of requests
            duration, // Per time window (seconds)
            blockDuration: 300, // Block for 5 minutes if exceeded
            keyPrefix: 'ratelimit',
        });
    } else {
        // Fallback to in-memory rate limiter
        logger.warn('⚠️  Redis unavailable, using in-memory rate limiter');
        return new RateLimiterMemory({
            points,
            duration,
            blockDuration: 300,
        });
    }
};

/**
 * General API rate limiter
 * Default: 100 requests per 15 minutes
 */
export const apiRateLimiter = createRedisLimiter(
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900') / 1000
);

/**
 * WebAuthn challenge rate limiter (stricter)
 * Prevents brute-force attacks on enrollment/auth
 * Default: 10 requests per 15 minutes
 */
export const webAuthnRateLimiter = createRedisLimiter(
    parseInt(process.env.RATE_LIMIT_WEBAUTHN_MAX || '10'),
    900 // 15 minutes
);

/**
 * Rate limiter middleware factory
 */
export const rateLimitMiddleware = (limiter: RateLimiterRedis | RateLimiterMemory) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Use IP address as key
            const key = req.ip || req.socket.remoteAddress || 'unknown';

            await limiter.consume(key);
            next();
        } catch (error: any) {
            logger.warn('🚫 Rate limit exceeded', {
                ip: req.ip,
                path: req.path,
                remaining: error.remainingPoints || 0,
            });

            res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: error.msBeforeNext ? Math.ceil(error.msBeforeNext / 1000) : 300,
            });
        }
    };
};

/**
 * General API rate limit
 */
export const apiRateLimit = rateLimitMiddleware(apiRateLimiter);

/**
 * WebAuthn rate limit
 */
export const webAuthnRateLimit = rateLimitMiddleware(webAuthnRateLimiter);

export default rateLimitMiddleware;
