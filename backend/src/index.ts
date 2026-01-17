import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
dotenv.config();
import { connectDatabase } from './config/database';
import { initCPPModule } from './services/cpp-bridge';
import enrollmentRoutes from './routes/enrollment.routes';
import serviceRoutes from './routes/service.routes';
// backend/src/index.ts
import redisClient, { connectRedis } from './config/redis';



// Load environment variables

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
app.use('/api/service', serviceRoutes); // Phase 2 routes

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
        version: '2.0.0',
        phase: 'Phase 2 - Pairwise DIDs & Selective Disclosure',
        endpoints: {
            health: '/health',
            enrollment: '/api/enrollment',
            serviceAuth: '/api/service/authorize',
            consentHistory: '/api/service/consent-history/:did'
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

        // Start Express server
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
