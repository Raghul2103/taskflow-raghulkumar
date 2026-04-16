import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import logger from './config/logger.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(() => {
    logger.info('MongoDB Connected');
});

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS with credentials support
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
    logger.info({ method: req.method, url: req.url }, 'Incoming request');
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({ error: 'server error' });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received. Shutting down gracefully');
    server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
    });
});

export { app };
