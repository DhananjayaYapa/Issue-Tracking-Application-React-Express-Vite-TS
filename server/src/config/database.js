/**
 * Database Configuration - PostgreSQL
 * ====================================
 * PostgreSQL connection pool using pg driver
 */

const { Pool } = require('pg');

// Create connection pool (reusable connections)
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    max: 10,                    // Maximum number of connections
    idleTimeoutMillis: 30000,   // Close idle connections after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
});

/**
 * Test database connection
 * Called on server startup to verify DB is accessible
 */
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Database connected successfully');
        client.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        return false;
    }
};

/**
 * Execute a query with parameters
 * @param {string} sql - SQL query string (use $1, $2, etc. for parameters)
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} - Query results (rows)
 */
const query = async (sql, params = []) => {
    const result = await pool.query(sql, params);
    return result.rows;
};

/**
 * Get a connection from the pool (for transactions)
 * @returns {Promise<Client>} - Database client
 */
const getConnection = async () => {
    return await pool.connect();
};

module.exports = {
    pool,
    query,
    getConnection,
    testConnection
};
