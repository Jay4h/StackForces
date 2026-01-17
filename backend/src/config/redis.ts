// backend/src/config/redis.ts
import { createClient } from 'redis';

// Use the REDIS_URL from your .env which must include the password
// redis://:<password>@<host>:<port>
const redisClient = createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));

// In-memory fallback storage when Redis is unavailable
const inMemoryStore = new Map<string, { value: string; expiresAt: number }>();

// Cleanup expired sessions every minute
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of inMemoryStore.entries()) {
        if (data.expiresAt < now) {
            inMemoryStore.delete(key);
        }
    }
}, 60000);

/**
 * Check if Redis is available
 */
export const isRedisAvailable = (): boolean => {
    return redisClient.isOpen;
};

/**
 * Custom named export to initialize the connection
 */
export const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log('✅ Connected to Redis');
        }
    } catch (err) {
        console.warn('⚠️  Redis connection failed - using in-memory session store:', err);
        // Don't throw - allow server to start without Redis
    }
};

/**
 * Set a value with expiration (works with or without Redis)
 */
export const setSession = async (key: string, value: string, ttlSeconds: number): Promise<void> => {
    try {
        if (isRedisAvailable()) {
            await redisClient.setEx(key, ttlSeconds, value);
        } else {
            // Fallback to in-memory store
            inMemoryStore.set(key, {
                value,
                expiresAt: Date.now() + (ttlSeconds * 1000)
            });
        }
    } catch (error) {
        console.warn('⚠️  Redis operation failed, using in-memory fallback:', error);
        inMemoryStore.set(key, {
            value,
            expiresAt: Date.now() + (ttlSeconds * 1000)
        });
    }
};

/**
 * Get a value (works with or without Redis)
 */
export const getSession = async (key: string): Promise<string | null> => {
    try {
        if (isRedisAvailable()) {
            return await redisClient.get(key);
        } else {
            // Fallback to in-memory store
            const data = inMemoryStore.get(key);
            if (data && data.expiresAt > Date.now()) {
                return data.value;
            }
            if (data) {
                inMemoryStore.delete(key); // Clean up expired
            }
            return null;
        }
    } catch (error) {
        console.warn('⚠️  Redis operation failed, using in-memory fallback:', error);
        const data = inMemoryStore.get(key);
        if (data && data.expiresAt > Date.now()) {
            return data.value;
        }
        return null;
    }
};

/**
 * Delete a key (works with or without Redis)
 */
export const deleteSession = async (key: string): Promise<void> => {
    try {
        if (isRedisAvailable()) {
            await redisClient.del(key);
        } else {
            inMemoryStore.delete(key);
        }
    } catch (error) {
        console.warn('⚠️  Redis operation failed, using in-memory fallback:', error);
        inMemoryStore.delete(key);
    }
};

export default redisClient;