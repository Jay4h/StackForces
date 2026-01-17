import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { initCPPModule } from './services/cpp-bridge';
import enrollmentRoutes from './routes/enrollment.routes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false // Allow WebAuthn API
}));

// CORS configuration
app.use(cors({
    origin: process.env.EXPECTED_ORIGIN || 'http://localhost:5173',
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
            health: '/health',
            enrollment: '/api/enrollment'
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
        // Connect to databases
        await connectDatabase();
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
