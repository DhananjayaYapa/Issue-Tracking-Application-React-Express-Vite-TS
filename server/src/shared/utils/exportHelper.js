const { Parser } = require('json2csv');

/**
 * Convert issues array to CSV format
 * @param {Array} issues - Array of issue objects
 * @returns {string} - CSV formatted string
 */
const exportToCSV = (issues) => {
    if (!issues || issues.length === 0) {
        return 'No data to export';
    }

    // Define CSV fields
    const fields = [
        { label: 'Issue ID', value: 'issue_id' },
        { label: 'Title', value: 'title' },
        { label: 'Description', value: 'description' },
        { label: 'Status', value: 'status' },
        { label: 'Priority', value: 'priority' },
        { label: 'Severity', value: 'severity' },
        { label: 'Created By', value: 'created_by_name' },
        { label: 'Assigned To', value: 'assigned_to_name' },
        { label: 'Created At', value: 'created_at' },
        { label: 'Updated At', value: 'updated_at' },
        { label: 'Resolved At', value: 'resolved_at' }
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(issues);

    return csv;
};

/**
 * Format issues array for JSON export
 * @param {Array} issues - Array of issue objects
 * @returns {Object} - Formatted JSON object
 */
const exportToJSON = (issues) => {
    return {
        exportDate: new Date().toISOString(),
        totalCount: issues.length,
        issues: issues.map(issue => ({
            id: issue.issue_id,
            title: issue.title,
            description: issue.description,
            status: issue.status,
            priority: issue.priority,
            severity: issue.severity,
            createdBy: issue.created_by_name,
            assignedTo: issue.assigned_to_name,
            createdAt: issue.created_at,
            updatedAt: issue.updated_at,
            resolvedAt: issue.resolved_at
        }))
    };
};

/**
 * Get current date string for filename
 * @returns {string} - Date string in YYYY-MM-DD format
 */
const getExportFilename = (format) => {
    const date = new Date().toISOString().split('T')[0];
    return `issues-export-${date}.${format}`;
};

module.exports = {
    exportToCSV,
    exportToJSON,
    getExportFilename
};
