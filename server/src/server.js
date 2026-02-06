// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.path}`);
        next();
    });
}

// ========================================
// Routes
// ========================================

// Mount all API routes under /api
app.use('/api', routes);

// Root endpoint - API info
app.get('/', (req, res) => {
    res.json({
        name: 'Issue Tracker API',
        version: '1.0.0',
        description: 'RESTful API for Issue Tracker with CRUD operations',
        endpoints: {
            health: 'GET /api/health',
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/profile'
            },
            issues: {
                list: 'GET /api/issues',
                create: 'POST /api/issues',
                getById: 'GET /api/issues/:id',
                update: 'PUT /api/issues/:id',
                delete: 'DELETE /api/issues/:id',
                statusCounts: 'GET /api/issues/stats/counts',
                exportCSV: 'GET /api/issues/export/csv',
                exportJSON: 'GET /api/issues/export/json'
            }
        },
        documentation: 'See README.md for full API documentation'
    });
});

// ========================================
// Error Handling (must be LAST)
// ========================================

// Handle 404 - Route not found
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ========================================
// Start Server
// ========================================

const startServer = async () => {
    try {
        // Test database connection first
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.warn('Database connection failed. Server will start but database operations may fail.');
        }

        // Start the server
        app.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log('🚀 ISSUE TRACKER SERVER STARTED');
            console.log('='.repeat(50));
            console.log(`📡 Server running on: http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📊 Database: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME}`);
            console.log('='.repeat(50));
            console.log('\n📖 Available endpoints:');
            console.log(`   GET  http://localhost:${PORT}/`);
            console.log(`   GET  http://localhost:${PORT}/api/health`);
            console.log(`   POST http://localhost:${PORT}/api/auth/register`);
            console.log(`   POST http://localhost:${PORT}/api/auth/login`);
            console.log(`   GET  http://localhost:${PORT}/api/issues`);
            console.log('='.repeat(50) + '\n');
        });

    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('\nSIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;
