/**
 * Issue Routes
 * ============
 * Handles all issue CRUD endpoints
 * 
 * Adapted from: olympus-backend-services/express-server/routes/attendanceRoutes.js
 */

const express = require('express');
const router = express.Router();
const IssueController = require('./issueController');
const { authenticate } = require('../../middleware/auth');
const {
    validateRequest,
    createIssueValidation,
    updateIssueValidation,
    updateStatusValidation,
    issueIdValidation,
    listIssuesValidation
} = require('../../middleware/validation');
const { asyncHandler } = require('../../middleware/errorHandler');

// ========================================
// All routes require authentication
// ========================================
router.use(authenticate);

// ========================================
// Static routes (must come before /:id)
// ========================================

/**
 * @route   GET /api/issues/stats/counts
 * @desc    Get issue counts grouped by status
 * @access  Private
 */
router.get(
    '/stats/counts',
    asyncHandler(IssueController.getStatusCounts)
);

/**
 * @route   GET /api/issues/export/csv
 * @desc    Export issues to CSV file
 * @access  Private
 * @query   status, priority, severity, search (optional filters)
 */
router.get(
    '/export/csv',
    asyncHandler(IssueController.exportCSV)
);

/**
 * @route   GET /api/issues/export/json
 * @desc    Export issues to JSON file
 * @access  Private
 * @query   status, priority, severity, search (optional filters)
 */
router.get(
    '/export/json',
    asyncHandler(IssueController.exportJSON)
);

/**
 * @route   GET /api/issues/my-issues
 * @desc    Get issues created by the authenticated user
 * @access  Private
 * @query   page, limit, status, priority
 */
router.get(
    '/my-issues',
    listIssuesValidation,
    validateRequest,
    asyncHandler(IssueController.getMyIssues)
);

// ========================================
// CRUD Routes
// ========================================

/**
 * @route   GET /api/issues
 * @desc    Get all issues with pagination and filters
 * @access  Private
 * @query   page, limit, status, priority, severity, search, sortBy, sortOrder
 */
router.get(
    '/',
    listIssuesValidation,
    validateRequest,
    asyncHandler(IssueController.getAllIssues)
);

/**
 * @route   POST /api/issues
 * @desc    Create new issue
 * @access  Private
 * @body    { title, description?, status?, priority?, severity?, assignedTo? }
 */
router.post(
    '/',
    createIssueValidation,
    validateRequest,
    asyncHandler(IssueController.createIssue)
);

/**
 * @route   GET /api/issues/:id
 * @desc    Get single issue by ID
 * @access  Private
 */
router.get(
    '/:id',
    issueIdValidation,
    validateRequest,
    asyncHandler(IssueController.getIssueById)
);

/**
 * @route   PUT /api/issues/:id
 * @desc    Update issue
 * @access  Private
 * @body    { title?, description?, status?, priority?, severity?, assignedTo? }
 */
router.put(
    '/:id',
    updateIssueValidation,
    validateRequest,
    asyncHandler(IssueController.updateIssue)
);

/**
 * @route   PATCH /api/issues/:id/status
 * @desc    Update issue status only
 * @access  Private
 * @body    { status }
 */
router.patch(
    '/:id/status',
    updateStatusValidation,
    validateRequest,
    asyncHandler(IssueController.updateStatus)
);

/**
 * @route   DELETE /api/issues/:id
 * @desc    Delete issue
 * @access  Private
 */
router.delete(
    '/:id',
    issueIdValidation,
    validateRequest,
    asyncHandler(IssueController.deleteIssue)
);

module.exports = router;
