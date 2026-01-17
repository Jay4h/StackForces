import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
    url: REDIS_URL
});

redisClient.on('error', (err) => console.error('❌ Redis Error:', err));
redisClient.on('connect', () => console.log('✅ Redis connected successfully'));

export const connectRedis = async (): Promise<void> => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('❌ Redis connection failed:', error);
        process.exit(1);
    }
};

export default redisClient;
