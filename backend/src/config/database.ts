/**
 * ========================================
 * PRODUCTION DATABASE CONFIGURATION
 * ========================================
 * MongoDB Connection with:
 * - Replica Set support (99.99% availability)
 * - Connection pooling
 * - Automatic reconnection with retry logic
 * - Graceful shutdown handling
 * - Production-optimized settings
 * ========================================
 */

import mongoose from 'mongoose';
// import { logger } from '../utils/logger'; // Removed to avoid circular dependency

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/praman';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Production-grade MongoDB connection configuration
 */
const connectionOptions: mongoose.ConnectOptions = {
    // Disable auto-indexing in production (performance optimization)
    autoIndex: !IS_PRODUCTION,

    // Server selection timeout (30 seconds)
    serverSelectionTimeoutMS: 30000,

    // Socket timeout (45 seconds to allow for longer operations)
    socketTimeoutMS: 45000,

    // Connection pool settings
    maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE || '50'),
    minPoolSize: 10,

    // Heartbeat frequency (10 seconds)
    heartbeatFrequencyMS: 10000,

    // Retry writes for replica sets
    retryWrites: true,

    // Write concern majority for replica sets
    w: 'majority',

    // Application name for monitoring
    appName: 'Praman-API',
};

/**
 * Retry strategy for connection failures
 */
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 5000;

let retryCount = 0;

/**
 * Connect to MongoDB with retry logic
 */
export const connectDatabase = async (): Promise<void> => {
    try {
        console.log('🔄 Attempting MongoDB connection...', {
            uri: MONGODB_URI.replace(/\/\/.*@/, '//***:***@'), // Redact credentials
            environment: process.env.NODE_ENV,
            options: {
                autoIndex: connectionOptions.autoIndex,
                poolSize: connectionOptions.maxPoolSize,
            }
        });

        await mongoose.connect(MONGODB_URI, connectionOptions);

        console.log('✅ MongoDB connected successfully', {
            host: mongoose.connection.host,
            database: mongoose.connection.name,
            readyState: mongoose.connection.readyState,
        });

        // Reset retry counter on successful connection
        retryCount = 0;

        // Setup connection event handlers
        setupConnectionHandlers();

    } catch (error: any) {
        retryCount++;
        console.error('❌ MongoDB connection failed', {
            attempt: retryCount,
            maxAttempts: MAX_RETRY_ATTEMPTS,
            error: error.message,
        });

        if (retryCount < MAX_RETRY_ATTEMPTS) {
            console.warn(`🔄 Retrying connection in ${RETRY_DELAY_MS / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            return connectDatabase(); // Recursive retry
        } else {
            console.error('💀 MongoDB connection failed after maximum retry attempts', {
                attempts: retryCount,
            });
            throw new Error('Failed to connect to MongoDB after maximum retry attempts');
        }
    }
};

/**
 * Setup MongoDB connection event handlers
 */
function setupConnectionHandlers(): void {
    const conn = mongoose.connection;

    // Connection established
    conn.on('connected', () => {
        console.log('🔗 MongoDB connection established');
    });

    // Connection disconnected
    conn.on('disconnected', () => {
        console.warn('⚠️  MongoDB connection disconnected');
    });

    // Connection reconnected
    conn.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected successfully');
    });

    // Connection error
    conn.on('error', (error) => {
        console.error('❌ MongoDB connection error', {
            error: error.message,
        });
    });

    // Mongoose model indexing errors
    conn.on('index', (error) => {
        if (error) {
            console.error('❌ MongoDB indexing error', {
                error: error.message,
            });
        }
    });
}

/**
 * Gracefully close database connection
 * Called during application shutdown
 */
export const closeDatabaseConnection = async (): Promise<void> => {
    try {
        console.log('🔄 Closing MongoDB connection...');

        await mongoose.connection.close();

        console.log('✅ MongoDB connection closed gracefully');
    } catch (error: any) {
        console.error('❌ Error closing MongoDB connection', {
            error: error.message,
        });
        throw error;
    }
};

/**
 * Check database health status
 */
export const getDatabaseHealth = (): {
    status: string;
    readyState: number;
    host: string;
    database: string;
} => {
    const conn = mongoose.connection;

    return {
        status: conn.readyState === 1 ? 'connected' : 'disconnected',
        readyState: conn.readyState,
        host: conn.host || 'unknown',
        database: conn.name || 'unknown',
    };
};

export default mongoose;
