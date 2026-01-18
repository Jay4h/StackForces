// MUST BE FIRST - Load environment variables
import './config/env';

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDatabase } from './config/database';
import { initCPPModule } from './services/cpp-bridge';
import enrollmentRoutes from './routes/enrollment.routes';
import healthRoutes from './routes/health.routes';
import userRoutes from './routes/user.routes';
import profileRoutes from './routes/profile.routes';
import familyRoutes from './routes/family.routes';
import oauthRoutes from './routes/oauth.routes';
import redisClient, { connectRedis } from './config/redis';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false // Allow WebAuthn API
}));

// CORS configuration - Allow localhost and ngrok URLs for mobile testing
const allowedOrigins = [
    'http://localhost:5173',
    'https://1b30460bb018.ngrok-free.app',
    process.env.EXPECTED_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // For development, allow any ngrok URL
            if (origin.includes('ngrok-free.app') || origin.includes('ngrok.io')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/enrollment', enrollmentRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/user', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/oauth', oauthRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'Bharat-ID API'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: '🇮🇳 Bharat-ID API',
        version: '1.0.0',
        endpoints: {
            healthCheck: '/health',
            enrollment: '/api/enrollment',
            healthPortal: '/api/health',
            user: '/api/user'
        }
    });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Start server
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDatabase();

        // Connect to Redis (optional - graceful fallback)
        await connectRedis();

        // Initialize C++ module (with graceful fallback)
        initCPPModule();

        //  Start Express server
        app.listen(PORT, () => {
            console.log('=================================');
            console.log('🇮🇳  Bharat-ID Backend Server');
            console.log('=================================');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 API: http://localhost:${PORT}/api`);
            console.log(`🏥 Health: http://localhost:${PORT}/health`);
            console.log('=================================');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
export default app;
