/**
 * Auth Model - User Database Operations (PostgreSQL)
 * ===================================================
 * Handles all user-related database queries
 */

const { query } = require('../../config/database');

class AuthModel {
    /**
     * Create a new user
     * @param {Object} userData - { name, email, passwordHash }
     * @returns {Promise<Object>} - Created user with user_id
     */
    static async createUser(userData) {
        const sql = `
            INSERT INTO users (name, email, password_hash, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING user_id, name, email, created_at
        `;

        const results = await query(sql, [
            userData.name,
            userData.email,
            userData.passwordHash
        ]);

        return results[0];
    }

    /**
     * Find user by email
     * @param {string} email - User email
     * @returns {Promise<Object|null>} - User object or null
     */
    static async findByEmail(email) {
        const sql = `
            SELECT 
                user_id,
                name,
                email,
                password_hash,
                created_at,
                updated_at,
                is_enabled
            FROM users
            WHERE email = $1 AND is_enabled = true
            LIMIT 1
        `;

        const results = await query(sql, [email]);
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Find user by ID
     * @param {number} userId - User ID
     * @returns {Promise<Object|null>} - User object (without password) or null
     */
    static async findById(userId) {
        const sql = `
            SELECT 
                user_id,
                name,
                email,
                created_at,
                updated_at
            FROM users
            WHERE user_id = $1 AND is_enabled = true
            LIMIT 1
        `;

        const results = await query(sql, [userId]);
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Check if email exists
     * @param {string} email - Email to check
     * @returns {Promise<boolean>} - True if email exists
     */
    static async emailExists(email) {
        const sql = `
            SELECT COUNT(*) as count
            FROM users
            WHERE email = $1
        `;

        const results = await query(sql, [email]);
        return parseInt(results[0].count) > 0;
    }

    /**
     * Update user profile
     * @param {number} userId - User ID
     * @param {Object} userData - Fields to update { name }
     * @returns {Promise<Object>} - Updated user
     */
    static async updateUser(userId, userData) {
        const sql = `
            UPDATE users
            SET name = $1, updated_at = NOW()
            WHERE user_id = $2 AND is_enabled = true
            RETURNING user_id, name, email, updated_at
        `;

        const results = await query(sql, [userData.name, userId]);
        return results[0];
    }

    /**
     * Update user password
     * @param {number} userId - User ID
     * @param {string} passwordHash - New password hash
     * @returns {Promise<Object>} - Update result
     */
    static async updatePassword(userId, passwordHash) {
        const sql = `
            UPDATE users
            SET password_hash = $1, updated_at = NOW()
            WHERE user_id = $2 AND is_enabled = true
            RETURNING user_id
        `;

        const results = await query(sql, [passwordHash, userId]);
        return results[0];
    }

    /**
     * Soft delete user (disable account)
     * @param {number} userId - User ID
     * @returns {Promise<Object>} - Update result
     */
    static async deleteUser(userId) {
        const sql = `
            UPDATE users
            SET is_enabled = false, updated_at = NOW()
            WHERE user_id = $1
            RETURNING user_id
        `;

        const results = await query(sql, [userId]);
        return results[0];
    }

    /**
     * Get all users (for admin purposes)
     * @returns {Promise<Array>} - Array of user objects
     */
    static async getAllUsers() {
        const sql = `
            SELECT 
                user_id,
                name,
                email,
                created_at,
                updated_at
            FROM users
            WHERE is_enabled = true
            ORDER BY created_at DESC
        `;

        const results = await query(sql);
        return results;
    }
}

module.exports = AuthModel;
