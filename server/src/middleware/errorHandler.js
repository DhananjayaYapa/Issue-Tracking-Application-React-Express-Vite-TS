/**
 * Error Handler Middleware
 * ========================
 * Centralized error handling for the application
 * Catches all errors and returns consistent error responses
 * 
 * Adapted from: olympus-backend-services/express-server/middleware/auth.js
 */

const { errorResponse } = require('../shared/utils/responseHelper');

/**
 * Custom API Error class
 * Allows throwing errors with specific status codes
 */
class ApiError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Distinguishes operational errors from programming errors
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends ApiError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

/**
 * Validation Error (400)
 */
class ValidationError extends ApiError {
    constructor(message = 'Validation failed', errors = null) {
        super(message, 400);
        this.errors = errors;
    }
}

/**
 * Unauthorized Error (401)
 */
class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized access') {
        super(message, 401);
    }
}

/**
 * Forbidden Error (403)
 */
class ForbiddenError extends ApiError {
    constructor(message = 'Access forbidden') {
        super(message, 403);
    }
}

/**
 * Error Handler Middleware
 * Must be the LAST middleware in the chain
 */
const errorHandler = (err, req, res, next) => {
    // Log the error
    console.error('='.repeat(50));
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('='.repeat(50));

    // Default error values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors || null;

    // Handle specific error types
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token has expired';
    } else if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 409;
        message = 'Duplicate entry - resource already exists';
    } else if (err.code === 'ER_NO_SUCH_TABLE') {
        statusCode = 500;
        message = 'Database table not found';
    }

    // In production, don't expose internal error details
    if (process.env.NODE_ENV === 'production' && !err.isOperational) {
        message = 'An unexpected error occurred';
        errors = null;
    }

    return errorResponse(res, message, statusCode, errors);
};

/**
 * 404 Not Found Handler
 * Catches requests to undefined routes
 */
const notFoundHandler = (req, res, next) => {
    return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 * Eliminates the need for try-catch in every controller
 * 
 * Usage: router.get('/path', asyncHandler(controller.method))
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    ApiError,
    NotFoundError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    errorHandler,
    notFoundHandler,
    asyncHandler
};
