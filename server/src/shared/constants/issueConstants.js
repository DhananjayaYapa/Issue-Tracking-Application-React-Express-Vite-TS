/**
 * Issue Constants
 * ===============
 * Centralized constants for issue-related values
 * Similar to Olympus layers/com.olympus.common.constants
 */

// Issue Status Values
const ISSUE_STATUS = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed'
};

// Issue Priority Values
const ISSUE_PRIORITY = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical'
};

// Issue Severity Values
const ISSUE_SEVERITY = {
    MINOR: 'Minor',
    MAJOR: 'Major',
    CRITICAL: 'Critical'
};

// Valid values for validation
const VALID_STATUSES = Object.values(ISSUE_STATUS);
const VALID_PRIORITIES = Object.values(ISSUE_PRIORITY);
const VALID_SEVERITIES = Object.values(ISSUE_SEVERITY);

module.exports = {
    ISSUE_STATUS,
    ISSUE_PRIORITY,
    ISSUE_SEVERITY,
    VALID_STATUSES,
    VALID_PRIORITIES,
    VALID_SEVERITIES
};
