/**
 * Auth Routes
 * ===========
 * Handles user authentication endpoints
 * 
 * Adapted from: olympus-backend-services/express-server/routes/attendanceRoutes.js
 */

const express = require('express');
const router = express.Router();
const AuthController = require('./authController');
const { authenticate } = require('../../middleware/auth');
const {
    validateRequest,
    registerValidation,
    loginValidation
} = require('../../middleware/validation');
const { asyncHandler } = require('../../middleware/errorHandler');

// ========================================
// Public Routes (no authentication required)
// ========================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { name, email, password }
 */
router.post(
    '/register',
    registerValidation,
    validateRequest,
    asyncHandler(AuthController.register)
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 * @body    { email, password }
 */
router.post(
    '/login',
    loginValidation,
    validateRequest,
    asyncHandler(AuthController.login)
);

// ========================================
// Protected Routes (authentication required)
// ========================================

/**
 * @route   GET /api/auth/profile
 * @desc    Get authenticated user's profile
 * @access  Private
 * @headers Authorization: Bearer <token>
 */
router.get(
    '/profile',
    authenticate,
    asyncHandler(AuthController.getProfile)
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update authenticated user's profile
 * @access  Private
 * @body    { name }
 */
router.put(
    '/profile',
    authenticate,
    asyncHandler(AuthController.updateProfile)
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change authenticated user's password
 * @access  Private
 * @body    { currentPassword, newPassword }
 */
router.put(
    '/change-password',
    authenticate,
    asyncHandler(AuthController.changePassword)
);

module.exports = router;
