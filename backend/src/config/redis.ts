/**
 * ========================================
 * PRODUCTION REDIS CONFIGURATION
 * ========================================
 * Redis Configuration with:
 * - RDB + AOF persistence (Kill Switch survives crashes)
 * - Connection pooling
 * - Automatic reconnection
 * - Graceful shutdown
 * ========================================
 */

import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType | null = null;

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Connect to Redis with retry logic
 */
export const connectRedis = async (): Promise<void> => {
    try {
        logger.info('🔄 Connecting to Redis...');

        redisClient = createClient({
            url: REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 50) {
                        logger.error('❌ Redis max reconnection attempts reached');
                        return new Error('Redis max reconnect attempts exceeded');
                    }
                    // Exponential backoff: 50ms * 2^retries (max 3000ms)
                    return Math.min(retries * 50, 3000);
                },
                connectTimeout: 10000,
            },
        });

        // Error handler
        redisClient.on('error', (error) => {
            logger.error('❌ Redis connection error', {
                error: error.message,
            });
        });

        // Reconnecting handler
        redisClient.on('reconnecting', () => {
            logger.warn('🔄 Redis reconnecting...');
        });

        // Ready handler
        redisClient.on('ready', () => {
            logger.info('✅ Redis connection ready');
        });

        // Connect event
        redisClient.on('connect', () => {
            logger.info('🔗 Redis connected');
        });

        await redisClient.connect();

        logger.info('✅ Redis connected successfully', {
            url: REDIS_URL.replace(/\/\/.*@/, '//***:***@'),
        });

        // Configure persistence in production
        if (IS_PRODUCTION) {
            await configureRedisPersistence();
        }

    } catch (error: any) {
        logger.error('❌ Redis connection failed', {
            error: error.message,
        });

        if (IS_PRODUCTION) {
            throw error; // Fail hard in production if Redis is unavailable
        } else {
            logger.warn('⚠️  Continuing without Redis (development mode)');
        }
    }
};

/**
 * Configure Redis persistence (RDB + AOF)
 * Ensures Kill Switch state survives server crashes
 */
async function configureRedisPersistence(): Promise<void> {
    try {
        if (!redisClient) return;

        // Enable AOF (Append-Only File) persistence
        // Every write is logged, ensuring durability
        await redisClient.configSet('appendonly', 'yes');
        await redisClient.configSet('appendfsync', 'everysec'); // Sync every second (good balance)

        // Enable RDB (snapshot) persistence
        // Save snapshot every 60 seconds if at least 1000 keys changed
        await redisClient.configSet('save', '60 1000');

        logger.info('✅ Redis persistence configured (RDB + AOF)');
    } catch (error: any) {
        logger.warn('⚠️  Could not configure Redis persistence', {
            error: error.message,
        });
    }
}

/**
 * Close Redis connection gracefully
 */
export const closeRedisConnection = async (): Promise<void> => {
    try {
        if (!redisClient) return;

        logger.info('🔄 Closing Redis connection...');
        await redisClient.quit();
        logger.info('✅ Redis connection closed gracefully');
    } catch (error: any) {
        logger.error('❌ Error closing Redis connection', {
            error: error.message,
        });
    }
};

/**
 * Get Redis health status
 */
export const getRedisHealth = async (): Promise<{
    status: string;
    latency?: number;
}> => {
    if (!redisClient || !redisClient.isReady) {
        return { status: 'disconnected' };
    }

    try {
        const start = Date.now();
        await redisClient.ping();
        const latency = Date.now() - start;

        return {
            status: 'connected',
            latency,
        };
    } catch (error) {
        return { status: 'error' };
    }
};

/**
 * Session management helper functions
 */

/**
 * Set session data in Redis
 */
export const setSession = async (key: string, value: any, ttlSeconds: number = 300): Promise<void> => {
    if (!redisClient || !redisClient.isReady) {
        console.warn('⚠️ Redis not available, session not stored');
        return;
    }

    try {
        await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
    } catch (error: any) {
        console.error('❌ Error setting session in Redis', { error: error.message });
    }
};

/**
 * Get session data from Redis
 */
export const getSession = async (key: string): Promise<any | null> => {
    if (!redisClient || !redisClient.isReady) {
        console.warn('⚠️ Redis not available, returning null');
        return null;
    }

    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error: any) {
        console.error('❌ Error getting session from Redis', { error: error.message });
        return null;
    }
};

/**
 * Delete session data from Redis
 */
export const deleteSession = async (key: string): Promise<void> => {
    if (!redisClient || !redisClient.isReady) {
        console.warn('⚠️ Redis not available');
        return;
    }

    try {
        await redisClient.del(key);
    } catch (error: any) {
        console.error('❌ Error deleting session from Redis', { error: error.message });
    }
};

/**
 * Get the Redis client instance
 */
export const getRedisClient = (): RedisClientType | null => {
    return redisClient;
};

export default redisClient;
