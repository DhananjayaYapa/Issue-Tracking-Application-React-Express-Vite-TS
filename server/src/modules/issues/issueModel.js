/**
 * Issue Model - Issue Database Operations (PostgreSQL)
 * =====================================================
 * Handles all issue-related database queries
 */

const { query, getConnection } = require('../../config/database');
const { ISSUE_STATUS } = require('../../shared/constants/issueConstants');

class IssueModel {
    /**
     * Get all issues with pagination and filters
     * @param {Object} options - { page, limit, status, priority, severity, search, sortBy, sortOrder, createdBy }
     * @returns {Promise<Object>} - { issues, total, totalPages }
     */
    static async getAllIssues(options = {}) {
        const {
            page = 1,
            limit = 10,
            status,
            priority,
            severity,
            search,
            sortBy = 'created_at',
            sortOrder = 'DESC',
            createdBy
        } = options;

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Build WHERE conditions dynamically
        let conditions = ['1=1']; // Always true base condition
        let params = [];
        let paramIndex = 1;

        if (status) {
            conditions.push(`i.status = $${paramIndex++}`);
            params.push(status);
        }

        if (priority) {
            conditions.push(`i.priority = $${paramIndex++}`);
            params.push(priority);
        }

        if (severity) {
            conditions.push(`i.severity = $${paramIndex++}`);
            params.push(severity);
        }

        if (createdBy) {
            conditions.push(`i.created_by = $${paramIndex++}`);
            params.push(createdBy);
        }

        if (search) {
            conditions.push(`(i.title ILIKE $${paramIndex} OR i.description ILIKE $${paramIndex})`);
            paramIndex++;
            const searchPattern = `%${search}%`;
            params.push(searchPattern);
        }

        const whereClause = conditions.join(' AND ');

        // Validate sort field to prevent SQL injection
        const validSortFields = ['created_at', 'updated_at', 'title', 'priority', 'status', 'severity'];
        const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
        const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // Get total count
        const countSql = `
            SELECT COUNT(*) as total
            FROM issues i
            WHERE ${whereClause}
        `;
        const countResult = await query(countSql, params);
        const total = parseInt(countResult[0].total);

        // Get paginated issues with user info
        const sql = `
            SELECT 
                i.issue_id,
                i.title,
                i.description,
                i.status,
                i.priority,
                i.severity,
                i.created_by,
                i.assigned_to,
                i.created_at,
                i.updated_at,
                i.resolved_at,
                creator.name as creator_name,
                creator.email as creator_email,
                assignee.name as assignee_name,
                assignee.email as assignee_email
            FROM issues i
            LEFT JOIN users creator ON i.created_by = creator.user_id
            LEFT JOIN users assignee ON i.assigned_to = assignee.user_id
            WHERE ${whereClause}
            ORDER BY i.${safeSortBy} ${safeSortOrder}
            LIMIT $${paramIndex++} OFFSET $${paramIndex++}
        `;

        const issues = await query(sql, [...params, parseInt(limit), parseInt(offset)]);

        return {
            issues,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            perPage: parseInt(limit)
        };
    }

    /**
     * Get single issue by ID
     * @param {number} issueId - Issue ID
     * @returns {Promise<Object|null>} - Issue object or null
     */
    static async getIssueById(issueId) {
        const sql = `
            SELECT 
                i.issue_id,
                i.title,
                i.description,
                i.status,
                i.priority,
                i.severity,
                i.created_by,
                i.assigned_to,
                i.created_at,
                i.updated_at,
                i.resolved_at,
                creator.name as creator_name,
                creator.email as creator_email,
                assignee.name as assignee_name,
                assignee.email as assignee_email
            FROM issues i
            LEFT JOIN users creator ON i.created_by = creator.user_id
            LEFT JOIN users assignee ON i.assigned_to = assignee.user_id
            WHERE i.issue_id = $1
            LIMIT 1
        `;

        const results = await query(sql, [issueId]);
        return results.length > 0 ? results[0] : null;
    }

    /**
     * Create new issue
     * @param {Object} issueData - { title, description, status, priority, severity, createdBy, assignedTo }
     * @returns {Promise<Object>} - Created issue
     */
    static async createIssue(issueData) {
        const {
            title,
            description = null,
            status = ISSUE_STATUS.OPEN,
            priority = 'Medium',
            severity = 'Minor',
            createdBy,
            assignedTo = null
        } = issueData;

        const sql = `
            INSERT INTO issues 
            (title, description, status, priority, severity, created_by, assigned_to, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING issue_id
        `;

        const results = await query(sql, [
            title,
            description,
            status,
            priority,
            severity,
            createdBy,
            assignedTo
        ]);

        return { insertId: results[0].issue_id };
    }

    /**
     * Update issue
     * @param {number} issueId - Issue ID
     * @param {Object} issueData - Fields to update
     * @returns {Promise<Object>} - Update result
     */
    static async updateIssue(issueId, issueData) {
        const {
            title,
            description,
            status,
            priority,
            severity,
            assignedTo
        } = issueData;

        // Build dynamic update query
        let updateFields = [];
        let params = [];
        let paramIndex = 1;

        if (title !== undefined) {
            updateFields.push(`title = $${paramIndex++}`);
            params.push(title);
        }
        if (description !== undefined) {
            updateFields.push(`description = $${paramIndex++}`);
            params.push(description);
        }
        if (status !== undefined) {
            updateFields.push(`status = $${paramIndex++}`);
            params.push(status);

            // Set resolved_at if status is Resolved or Closed
            if (status === ISSUE_STATUS.RESOLVED || status === ISSUE_STATUS.CLOSED) {
                updateFields.push('resolved_at = NOW()');
            }
        }
        if (priority !== undefined) {
            updateFields.push(`priority = $${paramIndex++}`);
            params.push(priority);
        }
        if (severity !== undefined) {
            updateFields.push(`severity = $${paramIndex++}`);
            params.push(severity);
        }
        if (assignedTo !== undefined) {
            updateFields.push(`assigned_to = $${paramIndex++}`);
            params.push(assignedTo);
        }

        // Always update updated_at
        updateFields.push('updated_at = NOW()');

        if (updateFields.length === 1) {
            // Only updated_at, nothing else to update
            return { affectedRows: 0 };
        }

        const sql = `
            UPDATE issues
            SET ${updateFields.join(', ')}
            WHERE issue_id = $${paramIndex}
            RETURNING issue_id
        `;

        params.push(issueId);
        const results = await query(sql, params);
        return { affectedRows: results.length };
    }

    /**
     * Update issue status only
     * @param {number} issueId - Issue ID
     * @param {string} status - New status
     * @returns {Promise<Object>} - Update result
     */
    static async updateStatus(issueId, status) {
        let sql;

        if (status === ISSUE_STATUS.RESOLVED || status === ISSUE_STATUS.CLOSED) {
            sql = `
                UPDATE issues
                SET status = $1, resolved_at = NOW(), updated_at = NOW()
                WHERE issue_id = $2
                RETURNING issue_id
            `;
        } else {
            sql = `
                UPDATE issues
                SET status = $1, resolved_at = NULL, updated_at = NOW()
                WHERE issue_id = $2
                RETURNING issue_id
            `;
        }

        const results = await query(sql, [status, issueId]);
        return { affectedRows: results.length };
    }

    /**
     * Delete issue
     * @param {number} issueId - Issue ID
     * @returns {Promise<Object>} - Delete result
     */
    static async deleteIssue(issueId) {
        const sql = `DELETE FROM issues WHERE issue_id = $1 RETURNING issue_id`;
        const results = await query(sql, [issueId]);
        return { affectedRows: results.length };
    }

    /**
     * Get issue counts by status
     * @returns {Promise<Object>} - { Open: n, 'In Progress': n, Resolved: n, Closed: n, total: n }
     */
    static async getStatusCounts() {
        const sql = `
            SELECT 
                status,
                COUNT(*) as count
            FROM issues
            GROUP BY status
        `;

        const results = await query(sql);

        // Format results into an object
        const counts = {
            Open: 0,
            'In Progress': 0,
            Resolved: 0,
            Closed: 0,
            total: 0
        };

        results.forEach(row => {
            counts[row.status] = parseInt(row.count);
            counts.total += parseInt(row.count);
        });

        return counts;
    }

    /**
     * Check if issue exists
     * @param {number} issueId - Issue ID
     * @returns {Promise<boolean>} - True if exists
     */
    static async issueExists(issueId) {
        const sql = `SELECT COUNT(*) as count FROM issues WHERE issue_id = $1`;
        const results = await query(sql, [issueId]);
        return parseInt(results[0].count) > 0;
    }

    /**
     * Check if user is the creator of the issue
     * @param {number} issueId - Issue ID
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} - True if user is the creator
     */
    static async isIssueOwner(issueId, userId) {
        const sql = `
            SELECT COUNT(*) as count 
            FROM issues 
            WHERE issue_id = $1 AND created_by = $2
        `;
        const results = await query(sql, [issueId, userId]);
        return parseInt(results[0].count) > 0;
    }

    /**
     * Get all issues for export (no pagination)
     * @param {Object} options - { status, priority, search }
     * @returns {Promise<Array>} - All matching issues
     */
    static async getIssuesForExport(options = {}) {
        const { status, priority, severity, search } = options;

        let conditions = ['1=1'];
        let params = [];
        let paramIndex = 1;

        if (status) {
            conditions.push(`i.status = $${paramIndex++}`);
            params.push(status);
        }
        if (priority) {
            conditions.push(`i.priority = $${paramIndex++}`);
            params.push(priority);
        }
        if (severity) {
            conditions.push(`i.severity = $${paramIndex++}`);
            params.push(severity);
        }
        if (search) {
            conditions.push(`(i.title ILIKE $${paramIndex} OR i.description ILIKE $${paramIndex})`);
            paramIndex++;
            const searchPattern = `%${search}%`;
            params.push(searchPattern);
        }

        const whereClause = conditions.join(' AND ');

        const sql = `
            SELECT 
                i.issue_id,
                i.title,
                i.description,
                i.status,
                i.priority,
                i.severity,
                creator.name as created_by_name,
                assignee.name as assigned_to_name,
                i.created_at,
                i.updated_at,
                i.resolved_at
            FROM issues i
            LEFT JOIN users creator ON i.created_by = creator.user_id
            LEFT JOIN users assignee ON i.assigned_to = assignee.user_id
            WHERE ${whereClause}
            ORDER BY i.created_at DESC
        `;

        const results = await query(sql, params);
        return results;
    }
}

module.exports = IssueModel;
