const IssueModel = require('./issueModel');
const {
    successResponse,
    createdResponse,
    paginatedResponse,
    notFoundResponse,
    badRequestResponse,
    noContentResponse
} = require('../../shared/utils/responseHelper');
const { exportToCSV, exportToJSON, getExportFilename } = require('../../shared/utils/exportHelper');
const { NotFoundError } = require('../../middleware/errorHandler');

class IssueController {
    /**
     * GET /api/issues
     * Get all issues with pagination and filters
     */
    static async getAllIssues(req, res, next) {
        try {
            const {
                page = 1,
                limit = 10,
                status,
                priority,
                severity,
                search,
                sortBy = 'created_at',
                sortOrder = 'desc'
            } = req.query;

            const result = await IssueModel.getAllIssues({
                page: parseInt(page),
                limit: parseInt(limit),
                status,
                priority,
                severity,
                search,
                sortBy,
                sortOrder
            });

            // Format issues for response
            const formattedIssues = result.issues.map(issue => formatIssueResponse(issue));

            return paginatedResponse(
                res,
                formattedIssues,
                {
                    page: result.currentPage,
                    limit: result.perPage,
                    total: result.total,
                    totalPages: result.totalPages
                },
                'Issues retrieved successfully'
            );

        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/issues/stats/counts
     * Get issue counts grouped by status
     */
    static async getStatusCounts(req, res, next) {
        try {
            const counts = await IssueModel.getStatusCounts();

            return successResponse(res, counts, 'Status counts retrieved successfully');

        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/issues/export/csv
     * Export issues to CSV
     */
    static async exportCSV(req, res, next) {
        try {
            const { status, priority, severity, search } = req.query;

            const issues = await IssueModel.getIssuesForExport({
                status,
                priority,
                severity,
                search
            });

            const csv = exportToCSV(issues);
            const filename = getExportFilename('csv');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            return res.send(csv);

        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/issues/export/json
     * Export issues to JSON
     */
    static async exportJSON(req, res, next) {
        try {
            const { status, priority, severity, search } = req.query;

            const issues = await IssueModel.getIssuesForExport({
                status,
                priority,
                severity,
                search
            });

            const jsonData = exportToJSON(issues);
            const filename = getExportFilename('json');

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            return res.json(jsonData);

        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/issues/:id
     * Get single issue by ID
     */
    static async getIssueById(req, res, next) {
        try {
            const { id } = req.params;

            const issue = await IssueModel.getIssueById(id);

            if (!issue) {
                return notFoundResponse(res, 'Issue not found');
            }

            return successResponse(
                res,
                formatIssueResponse(issue),
                'Issue retrieved successfully'
            );

        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/issues
     * Create new issue
     */
    static async createIssue(req, res, next) {
        try {
            const { title, description, status, priority, severity, assignedTo } = req.body;
            const createdBy = req.user.userId;

            const result = await IssueModel.createIssue({
                title,
                description,
                status,
                priority,
                severity,
                createdBy,
                assignedTo
            });

            // Get the created issue with full details
            const issue = await IssueModel.getIssueById(result.insertId);

            return createdResponse(
                res,
                formatIssueResponse(issue),
                'Issue created successfully'
            );

        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/issues/:id
     * Update issue
     */
    static async updateIssue(req, res, next) {
        try {
            const { id } = req.params;
            const { title, description, status, priority, severity, assignedTo } = req.body;

            // Check if issue exists
            const existingIssue = await IssueModel.getIssueById(id);
            if (!existingIssue) {
                return notFoundResponse(res, 'Issue not found');
            }

            // Update the issue
            await IssueModel.updateIssue(id, {
                title,
                description,
                status,
                priority,
                severity,
                assignedTo
            });

            // Get updated issue
            const updatedIssue = await IssueModel.getIssueById(id);

            return successResponse(
                res,
                formatIssueResponse(updatedIssue),
                'Issue updated successfully'
            );

        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/issues/:id/status
     * Update issue status only
     */
    static async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Check if issue exists
            const existingIssue = await IssueModel.getIssueById(id);
            if (!existingIssue) {
                return notFoundResponse(res, 'Issue not found');
            }

            // Update status
            await IssueModel.updateStatus(id, status);

            // Get updated issue
            const updatedIssue = await IssueModel.getIssueById(id);

            return successResponse(
                res,
                formatIssueResponse(updatedIssue),
                `Issue status updated to "${status}"`
            );

        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/issues/:id
     * Delete issue
     */
    static async deleteIssue(req, res, next) {
        try {
            const { id } = req.params;

            // Check if issue exists
            const existingIssue = await IssueModel.getIssueById(id);
            if (!existingIssue) {
                return notFoundResponse(res, 'Issue not found');
            }

            // Delete the issue
            await IssueModel.deleteIssue(id);

            return successResponse(res, null, 'Issue deleted successfully');

        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/issues/my-issues
     * Get issues created by the authenticated user
     */
    static async getMyIssues(req, res, next) {
        try {
            const userId = req.user.userId;
            const { page = 1, limit = 10, status, priority } = req.query;

            const result = await IssueModel.getAllIssues({
                page: parseInt(page),
                limit: parseInt(limit),
                status,
                priority,
                createdBy: userId
            });

            const formattedIssues = result.issues.map(issue => formatIssueResponse(issue));

            return paginatedResponse(
                res,
                formattedIssues,
                {
                    page: result.currentPage,
                    limit: result.perPage,
                    total: result.total,
                    totalPages: result.totalPages
                },
                'Your issues retrieved successfully'
            );

        } catch (error) {
            next(error);
        }
    }
}

/**
 * Helper function to format issue response
 * Transforms database row to API response format
 */
function formatIssueResponse(issue) {
    return {
        id: issue.issue_id,
        title: issue.title,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        severity: issue.severity,
        createdBy: {
            id: issue.created_by,
            name: issue.creator_name,
            email: issue.creator_email
        },
        assignedTo: issue.assigned_to ? {
            id: issue.assigned_to,
            name: issue.assignee_name,
            email: issue.assignee_email
        } : null,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        resolvedAt: issue.resolved_at
    };
}

module.exports = IssueController;
