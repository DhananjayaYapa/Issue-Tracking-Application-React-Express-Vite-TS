/**
 * Response Helper Utilities
 * =========================
 * Standardized API response formats
 * Ensures consistent response structure across all endpoints
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Object} errors - Validation errors (optional)
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination info { page, limit, total, totalPages }
 * @param {string} message - Success message
 */
const paginatedResponse = (res, data, pagination, message = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            currentPage: pagination.page,
            perPage: pagination.limit,
            totalItems: pagination.total,
            totalPages: pagination.totalPages,
            hasNextPage: pagination.page < pagination.totalPages,
            hasPrevPage: pagination.page > 1
        },
        timestamp: new Date().toISOString()
    });
};

/**
 * Created response (201)
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {string} message - Success message
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
    return successResponse(res, data, message, 201);
};

/**
 * No content response (204)
 * @param {Object} res - Express response object
 */
const noContentResponse = (res) => {
    return res.status(204).send();
};

/**
 * Not found response (404)
 * @param {Object} res - Express response object
 * @param {string} message - Not found message
 */
const notFoundResponse = (res, message = 'Resource not found') => {
    return errorResponse(res, message, 404);
};

/**
 * Unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {string} message - Unauthorized message
 */
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
    return errorResponse(res, message, 401);
};

/**
 * Forbidden response (403)
 * @param {Object} res - Express response object
 * @param {string} message - Forbidden message
 */
const forbiddenResponse = (res, message = 'Access forbidden') => {
    return errorResponse(res, message, 403);
};

/**
 * Bad request response (400)
 * @param {Object} res - Express response object
 * @param {string} message - Bad request message
 * @param {Object} errors - Validation errors
 */
const badRequestResponse = (res, message = 'Bad request', errors = null) => {
    return errorResponse(res, message, 400, errors);
};

module.exports = {
    successResponse,
    errorResponse,
    paginatedResponse,
    createdResponse,
    noContentResponse,
    notFoundResponse,
    unauthorizedResponse,
    forbiddenResponse,
    badRequestResponse
};
