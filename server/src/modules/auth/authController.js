/**
 * Auth Controller - Authentication Business Logic
 * ================================================
 * Handles user registration, login, and profile operations
 * 
 * Adapted from: olympus-backend-services/express-server/controllers/attendanceController.js
 * Pattern: Class with static methods for request handling
 */

const bcrypt = require('bcryptjs');
const AuthModel = require('./authModel');
const { generateToken } = require('../../middleware/auth');
const {
    successResponse,
    createdResponse,
    badRequestResponse,
    unauthorizedResponse,
    notFoundResponse
} = require('../../shared/utils/responseHelper');
const { ValidationError, UnauthorizedError } = require('../../middleware/errorHandler');

// Number of salt rounds for bcrypt (10-12 is recommended)
const SALT_ROUNDS = 10;

class AuthController {
    /**
     * POST /api/auth/register
     * Register a new user
     */
    static async register(req, res, next) {
        try {
            const { name, email, password } = req.body;

            // Check if email already exists
            const existingUser = await AuthModel.emailExists(email);
            if (existingUser) {
                return badRequestResponse(res, 'Email already registered');
            }

            // Hash the password
            const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

            // Create user in database (PostgreSQL returns user directly)
            const createdUser = await AuthModel.createUser({
                name,
                email,
                passwordHash
            });

            // Generate JWT token
            const token = generateToken(createdUser);

            // Return success response
            return createdResponse(res, {
                user: {
                    userId: createdUser.user_id,
                    name: createdUser.name,
                    email: createdUser.email,
                    createdAt: createdUser.created_at
                },
                token
            }, 'User registered successfully');

        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/login
     * Login user and return JWT token
     */
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Find user by email
            const user = await AuthModel.findByEmail(email);

            if (!user) {
                return unauthorizedResponse(res, 'Invalid email or password');
            }

            // Compare passwords
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            if (!isPasswordValid) {
                return unauthorizedResponse(res, 'Invalid email or password');
            }

            // Generate JWT token
            const token = generateToken(user);

            // Return success response
            return successResponse(res, {
                user: {
                    userId: user.user_id,
                    name: user.name,
                    email: user.email
                },
                token
            }, 'Login successful');

        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/auth/profile
     * Get authenticated user's profile
     */
    static async getProfile(req, res, next) {
        try {
            // req.user is attached by authenticate middleware
            const userId = req.user.userId;

            // Get user from database
            const user = await AuthModel.findById(userId);

            if (!user) {
                return notFoundResponse(res, 'User not found');
            }

            // Return user profile
            return successResponse(res, {
                userId: user.user_id,
                name: user.name,
                email: user.email,
                createdAt: user.created_at,
                updatedAt: user.updated_at
            }, 'Profile retrieved successfully');

        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/auth/profile
     * Update authenticated user's profile
     */
    static async updateProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const { name } = req.body;

            // Update user
            await AuthModel.updateUser(userId, { name });

            // Get updated user
            const user = await AuthModel.findById(userId);

            return successResponse(res, {
                userId: user.user_id,
                name: user.name,
                email: user.email,
                updatedAt: user.updated_at
            }, 'Profile updated successfully');

        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/auth/change-password
     * Change authenticated user's password
     */
    static async changePassword(req, res, next) {
        try {
            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;

            // Get user with password hash
            const user = await AuthModel.findByEmail(req.user.email);

            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

            if (!isPasswordValid) {
                return badRequestResponse(res, 'Current password is incorrect');
            }

            // Hash new password
            const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

            // Update password
            await AuthModel.updatePassword(userId, passwordHash);

            return successResponse(res, null, 'Password changed successfully');

        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
