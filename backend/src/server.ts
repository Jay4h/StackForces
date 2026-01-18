/**
 * ========================================
 * PRAMAN PRODUCTION SERVER
 * ========================================
 * Entry point for 2026 production-ready infrastructure
 * - Graceful shutdown (SIGTERM/SIGINT)
 * - Centralized error handling
 * - Production security middleware
 * - Health checks & monitoring
 * ========================================
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
dotenv.config(); // Fallback to .env

// Infrastructure
import { connectDatabase, closeDatabaseConnection, getDatabaseHealth } from './config/database';
import { connectRedis, closeRedisConnection, getRedisHealth } from './config/redis';
import { initCPPModule, getCryptoEngineStatus } from './services/cpp-bridge';
import { logger, morganStream } from './utils/logger';

// Middleware
import { revocationMiddleware } from './middleware/revocation.middleware';
import { webAuthnRateLimit } from './middleware/rateLimiter.middleware';

// Routes (will be imported)
// import enrollmentRoutes from './routes/enrollment.routes';
// import authRoutes from './routes/auth.routes';
// import healthPortalRoutes from './routes/health.routes';

const app: Application = express();
const PORT = parseInt(process.env.PORT || '3000');
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ========================================
// SECURITY MIDDLEWARE
// ========================================

/**
 * Helmet.js - Security headers
 */
app.use(helmet({
    contentSecurityPolicy: process.env.CSP_ENABLED === 'true' ? {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // WebAuthn requires some inline scripts
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    } : false,
    hsts: IS_PRODUCTION ? {
        maxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000'),
        includeSubDomains: true,
        preload: true,
    } : false,
    frameguard: {
        action: process.env.FRAME_GUARD as 'deny' | 'sameorigin' || 'deny',
    },
    noSniff: true,
    xssFilter: true,
}));

/**
 * HPP - HTTP Parameter Pollution protection
 */
app.use(hpp());

/**
 * Compression
 */
app.use(compression());

/**
 * CORS - Production whitelist
 */
const allowedOrigins = IS_PRODUCTION
    ? (process.env.ALLOWED_ORIGINS || process.env.EXPECTED_ORIGIN || '').split(',')
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.EXPECTED_ORIGIN,
    ].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else if (!IS_PRODUCTION && origin.includes('ngrok')) {
            // Development: Allow ngrok URLs
            callback(null, true);
        } else {
            logger.warn('🚫 CORS blocked origin', { origin });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Global-DID', 'X-Pairwise-DID'],
}));

/**
 * Body parser
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request logging (Morgan + Winston)
 */
app.use(morgan(
    IS_PRODUCTION
        ? 'combined'
        : 'dev',
    { stream: morganStream }
));

// ========================================
// ROUTES
// ========================================

/**
 * Health check endpoint
 */
app.get(process.env.HEALTHCHECK_ENDPOINT || '/status', async (req: Request, res: Response) => {
    try {
        const [dbHealth, redisHealth, cryptoStatus] = await Promise.all([
            getDatabaseHealth(),
            getRedisHealth(),
            Promise.resolve(getCryptoEngineStatus()),
        ]);

        const healthy =
            dbHealth.status === 'connected' &&
            (redisHealth.status === 'connected' || !IS_PRODUCTION);

        res.status(healthy ? 200 : 503).json({
            status: healthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            service: 'Praman API',
            version: '1.0.0',
            environment: process.env.NODE_ENV,
            components: {
                database: dbHealth,
                redis: redisHealth,
                crypto: cryptoStatus,
            },
        });
    } catch (error: any) {
        logger.error('❌ Health check failed', { error: error.message });
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Health check failed',
        });
    }
});

/**
 * Root endpoint
 */
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: '🇮🇳 Praman - Decentralized Digital Identity',
        version: '1.0.0',
        environment: process.env.NODE_ENV,
        endpoints: {
            health: process.env.HEALTHCHECK_ENDPOINT || '/status',
            enrollment: '/api/enrollment',
            authentication: '/api/auth',
            healthPortal: '/api/health',
        },
    });
});

/**
 * API Routes (commented out - to be imported)
 */
// app.use('/api/enrollment', webAuthnRateLimit, enrollmentRoutes);
// app.use('/api/auth', webAuthnRateLimit, authRoutes);
// app.use('/api/health', revocationMiddleware, healthPortalRoutes);

// ========================================
// ERROR HANDLING
// ========================================

/**
 * 404 Handler
 */
app.use((req: Request, res: Response) => {
    logger.warn('🚫 Route not found', {
        method: req.method,
        path: req.path,
        ip: req.ip,
    });

    res.status(404).json({
        success: false,
        message: 'Route not found',
        code: 'ROUTE_NOT_FOUND',
    });
});

/**
 * Global error handler
 */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // Log detailed error
    logger.error('❌ Unhandled error', {
        error: err.message,
        stack: IS_PRODUCTION ? undefined : err.stack,
        method: req.method,
        path: req.path,
        ip: req.ip,
    });

    // Return generic error to client (security best practice)
    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        success: false,
        message: IS_PRODUCTION
            ? 'Internal server error'
            : err.message || 'Internal server error',
        code: err.code || 'INTERNAL_ERROR',
        ...(IS_PRODUCTION ? {} : { stack: err.stack }),
    });
});

// ========================================
// SERVER STARTUP
// ========================================

let server: any;

const startServer = async (): Promise<void> => {
    try {
        logger.info('🚀 Starting Praman server...', {
            environment: process.env.NODE_ENV,
            port: PORT,
        });

        // 1. Connect to MongoDB
        await connectDatabase();

        // 2. Connect to Redis
        await connectRedis();

        // 3. Initialize C++ cryptographic module
        initCPPModule();

        // 4. Start Express server
        server = app.listen(PORT, () => {
            logger.info('✅ Praman server started successfully', {
                port: PORT,
                environment: process.env.NODE_ENV,
                pid: process.pid,
            });

            console.log('╔═══════════════════════════════════════╗');
            console.log('║  🇮🇳  PRAMAN - Production Server     ║');
            console.log('╠═══════════════════════════════════════╣');
            console.log(`║  Environment: ${process.env.NODE_ENV?.padEnd(23)}║`);
            console.log(`║  Port:        ${PORT.toString().padEnd(23)}║`);
            console.log(`║  Status:      http://localhost:${PORT}/status   ║`);
            console.log('╚═══════════════════════════════════════╝');
        });

    } catch (error: any) {
        logger.fatal('💀 Failed to start server', {
            error: error.message,
            stack: error.stack,
        });
        process.exit(1);
    }
};

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`📡 Received ${signal}, starting graceful shutdown...`);

    const shutdownTimeout = parseInt(process.env.GRACEFUL_SHUTDOWN_TIMEOUT || '10000');

    // Set shutdown timeout
    const forceShutdownTimer = setTimeout(() => {
        logger.error('⚠️  Graceful shutdown timeout, forcing exit');
        process.exit(1);
    }, shutdownTimeout);

    try {
        // 1. Stop accepting new connections
        if (server) {
            await new Promise<void>((resolve) => {
                server.close(() => {
                    logger.info('✅ HTTP server closed');
                    resolve();
                });
            });
        }

        // 2. Close database connection
        await closeDatabaseConnection();

        // 3. Close Redis connection
        await closeRedisConnection();

        clearTimeout(forceShutdownTimer);

        logger.info('✅ Graceful shutdown completed');
        process.exit(0);
    } catch (error: any) {
        logger.error('❌ Error during shutdown', {
            error: error.message,
        });
        process.exit(1);
    }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    logger.fatal('💀 Uncaught exception', {
        error: error.message,
        stack: error.stack,
    });
    gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
    logger.fatal('💀 Unhandled promise rejection', {
        reason: reason?.message || reason,
    });
    gracefulShutdown('unhandledRejection');
});

// Start the server
startServer();

export default app;
