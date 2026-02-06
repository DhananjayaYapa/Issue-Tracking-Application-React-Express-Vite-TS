/**
 * Validation Middleware
 * =====================
 * Request validation using express-validator
 * Provides reusable validation rules and middleware
 */

const { validationResult, body, param, query } = require('express-validator');
const { badRequestResponse } = require('../shared/utils/responseHelper');

/**
 * Validate Request Middleware
 * Checks for validation errors and returns 400 if any exist
 * Must be placed AFTER validation rules in the middleware chain
 * 
 * Usage: 
 * router.post('/create', 
 *   [body('email').isEmail()], 
 *   validateRequest, 
 *   controller.create
 * )
 */
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg,
            value: err.value
        }));

        return badRequestResponse(res, 'Validation failed', formattedErrors);
    }

    next();
};

// ========================================
// Auth Validation Rules
// ========================================

const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain at least one number')
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
];

// ========================================
// Issue Validation Rules
// ========================================

const createIssueValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),

    body('priority')
        .optional()
        .isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority value'),

    body('severity')
        .optional()
        .isIn(['Minor', 'Major', 'Critical']).withMessage('Invalid severity value'),

    body('status')
        .optional()
        .isIn(['Open', 'In Progress', 'Resolved', 'Closed']).withMessage('Invalid status value')
];

const updateIssueValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid issue ID'),

    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),

    body('priority')
        .optional()
        .isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority value'),

    body('severity')
        .optional()
        .isIn(['Minor', 'Major', 'Critical']).withMessage('Invalid severity value'),

    body('status')
        .optional()
        .isIn(['Open', 'In Progress', 'Resolved', 'Closed']).withMessage('Invalid status value')
];

const updateStatusValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid issue ID'),

    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['Open', 'In Progress', 'Resolved', 'Closed']).withMessage('Invalid status value')
];

const issueIdValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('Invalid issue ID')
];

// ========================================
// Query Validation Rules (for list/search)
// ========================================

const listIssuesValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

    query('status')
        .optional()
        .isIn(['Open', 'In Progress', 'Resolved', 'Closed']).withMessage('Invalid status filter'),

    query('priority')
        .optional()
        .isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority filter'),

    query('sortBy')
        .optional()
        .isIn(['created_at', 'updated_at', 'title', 'priority', 'status']).withMessage('Invalid sort field'),

    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc', 'ASC', 'DESC']).withMessage('Sort order must be asc or desc')
];

module.exports = {
    validateRequest,
    // Auth validations
    registerValidation,
    loginValidation,
    // Issue validations
    createIssueValidation,
    updateIssueValidation,
    updateStatusValidation,
    issueIdValidation,
    listIssuesValidation
};
