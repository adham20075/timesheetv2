/**
 * Application Constants for MasTec Timesheet System
 * Centralized configuration values following PROJECT_BLUEPRINT.md
 */

// Application Information
export const APP_INFO = {
  name: 'MasTec Advanced Timesheet System',
  version: '1.0.0',
  description: 'Enterprise timesheet management for Henkels West Controls',
  company: 'MasTec',
  division: 'Henkels West Controls',
  supportEmail: 'support@mastec.com'
};

// Time and Date Constants
export const TIME_CONSTANTS = {
  HOURS_PER_DAY: 24,
  STANDARD_WORK_HOURS: 8,
  OVERTIME_THRESHOLD: 8,
  DOUBLETIME_THRESHOLD: 12,
  MAX_BREAK_HOURS: 4,
  MIN_TIME_INCREMENT: 0.25, // 15 minutes
  WEEKEND_DAYS: [0, 6], // Sunday = 0, Saturday = 6
  
  // Date format patterns
  DATE_FORMAT_ISO: 'YYYY-MM-DD',
  DATE_FORMAT_DISPLAY: 'MM/DD/YYYY',
  TIME_FORMAT_12H: 'h:mm A',
  TIME_FORMAT_24H: 'HH:mm'
};

// Business Rules
export const BUSINESS_RULES = {
  // Timesheet entry limits
  MAX_HOURS_PER_DAY: 24,
  MAX_DAYS_RETROACTIVE: 365,
  MAX_DAYS_FUTURE: 30,
  
  // Approval workflow
  APPROVAL_LEVELS: {
    SUPERVISOR: 1,
    MANAGER: 2,
    ADMIN: 3
  },
  
  // Premium time calculations
  OVERTIME_MULTIPLIER: 1.5,
  DOUBLETIME_MULTIPLIER: 2.0,
  HOLIDAY_MULTIPLIER: 2.0,
  
  // Data retention
  AUDIT_RETENTION_DAYS: 2555, // 7 years
  BACKUP_RETENTION_DAYS: 90,
  
  // Validation rules
  MIN_DESCRIPTION_LENGTH: 0,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_PROJECT_NAME_LENGTH: 3,
  MAX_PROJECT_NAME_LENGTH: 200,
  MIN_EMPLOYEE_NAME_LENGTH: 2,
  MAX_EMPLOYEE_NAME_LENGTH: 100
};

// UI Configuration
export const UI_CONFIG = {
  // Table pagination
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  
  // Loading and timeout
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  DEBOUNCE_DELAY: 300, // milliseconds
  
  // Notification display times
  SUCCESS_NOTIFICATION_DURATION: 3000,
  ERROR_NOTIFICATION_DURATION: 5000,
  WARNING_NOTIFICATION_DURATION: 4000,
  
  // Colors and themes
  THEME_COLORS: {
    primary: '#0056b3',
    secondary: '#6c757d',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8'
  },
  
  // Status colors
  STATUS_COLORS: {
    approved: '#28a745',
    pending: '#ffc107',
    rejected: '#dc3545',
    draft: '#6c757d',
    active: '#28a745',
    inactive: '#dc3545'
  }
};

// Database Configuration
export const DB_CONFIG = {
  // Connection settings
  MAX_CONNECTIONS: 10,
  CONNECTION_TIMEOUT: 30000,
  QUERY_TIMEOUT: 15000,
  
  // Schema version
  SCHEMA_VERSION: '1.0.0',
  
  // Table names
  TABLES: {
    BUSINESS_UNITS: 'business_units',
    EMPLOYEES: 'employees',
    PROJECTS: 'projects',
    JOBS: 'jobs',
    WORK_ORDERS: 'work_orders',
    COST_CODES: 'cost_codes',
    WORK_TYPES: 'work_types',
    TIMESHEET_ENTRIES: 'timesheet_entries',
    AUDIT_LOG: 'audit_log',
    SYSTEM_SETTINGS: 'system_settings'
  }
};

// API Endpoints (for future expansion)
export const API_ENDPOINTS = {
  BASE_URL: '/api/v1',
  
  // Timesheet operations
  TIMESHEET: '/timesheet',
  TIMESHEET_ENTRIES: '/timesheet/entries',
  TIMESHEET_APPROVAL: '/timesheet/approval',
  
  // Master data
  EMPLOYEES: '/employees',
  PROJECTS: '/projects',
  BUSINESS_UNITS: '/business-units',
  COST_CODES: '/cost-codes',
  
  // Reporting
  REPORTS: '/reports',
  EXPORT: '/export',
  
  // System
  HEALTH: '/health',
  VERSION: '/version'
};

// Validation Patterns
export const VALIDATION_PATTERNS = {
  EMPLOYEE_ID: /^EMP\d{3,}$/,
  BUSINESS_UNIT_CODE: /^\d{6}$/,
  PROJECT_ID: /^\d{8}$/,
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  TIME_24H: /^([01]?\d|2[0-3]):[0-5]\d$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_US: /^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
  SSN: /^\d{3}-\d{2}-\d{4}$/,
  COST_CODE: /^[A-Z]{2,}-[A-Z]{2,}$/
};

// Error Messages
export const ERROR_MESSAGES = {
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred',
  NETWORK_ERROR: 'Network connection error',
  SERVER_ERROR: 'Server error occurred',
  TIMEOUT_ERROR: 'Request timed out',
  
  // Validation errors
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  INVALID_DATE: 'Invalid date',
  INVALID_TIME: 'Invalid time',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PHONE: 'Invalid phone number',
  
  // Business rule errors
  HOURS_EXCEED_LIMIT: 'Hours cannot exceed daily limit',
  DATE_TOO_OLD: 'Date is too far in the past',
  DATE_TOO_FUTURE: 'Date is too far in the future',
  PROJECT_INACTIVE: 'Project is not active',
  EMPLOYEE_INACTIVE: 'Employee is not active',
  DUPLICATE_ENTRY: 'Duplicate entry found',
  
  // Authentication/Authorization
  ACCESS_DENIED: 'Access denied',
  SESSION_EXPIRED: 'Session has expired',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  TIMESHEET_SAVED: 'Timesheet saved successfully',
  TIMESHEET_APPROVED: 'Timesheet approved successfully',
  TIMESHEET_REJECTED: 'Timesheet rejected successfully',
  DATA_EXPORTED: 'Data exported successfully',
  SETTINGS_UPDATED: 'Settings updated successfully',
  PROFILE_UPDATED: 'Profile updated successfully'
};

// Dropdown Options
export const DROPDOWN_OPTIONS = {
  CONTRACT_TYPES: [
    { value: 'Time & Materials', label: 'Time & Materials' },
    { value: 'Fixed Bid', label: 'Fixed Bid' },
    { value: 'Unit Price', label: 'Unit Price' }
  ],
  
  PROJECT_STATUSES: [
    { value: 'Active', label: 'Active' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' }
  ],
  
  PRIORITY_LEVELS: [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' }
  ],
  
  PAY_GRADES: [
    { value: 'T1', label: 'Technician I' },
    { value: 'T2', label: 'Technician II' },
    { value: 'T3', label: 'Technician III' },
    { value: 'T4', label: 'Senior Technician' },
    { value: 'E1', label: 'Engineer I' },
    { value: 'E2', label: 'Engineer II' },
    { value: 'E3', label: 'Engineer III' },
    { value: 'E4', label: 'Senior Engineer' },
    { value: 'S1', label: 'Supervisor' },
    { value: 'S2', label: 'Senior Supervisor' },
    { value: 'M1', label: 'Manager' },
    { value: 'M2', label: 'Senior Manager' },
    { value: 'M3', label: 'Operations Manager' }
  ],
  
  EMPLOYEE_ROLES: [
    { value: 'Field Technician', label: 'Field Technician' },
    { value: 'Senior Technician', label: 'Senior Technician' },
    { value: 'Lead Technician', label: 'Lead Technician' },
    { value: 'Electrician', label: 'Electrician' },
    { value: 'Senior Electrician', label: 'Senior Electrician' },
    { value: 'Master Electrician', label: 'Master Electrician' },
    { value: 'Controls Engineer', label: 'Controls Engineer' },
    { value: 'Senior Engineer', label: 'Senior Engineer' },
    { value: 'Principal Engineer', label: 'Principal Engineer' },
    { value: 'Project Manager', label: 'Project Manager' },
    { value: 'Senior Project Manager', label: 'Senior Project Manager' },
    { value: 'Field Supervisor', label: 'Field Supervisor' },
    { value: 'Operations Manager', label: 'Operations Manager' },
    { value: 'Division Manager', label: 'Division Manager' }
  ]
};

// Export formats
export const EXPORT_FORMATS = {
  EXCEL: {
    extension: 'xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    name: 'Microsoft Excel'
  },
  PDF: {
    extension: 'pdf',
    mimeType: 'application/pdf',
    name: 'Adobe PDF'
  },
  CSV: {
    extension: 'csv',
    mimeType: 'text/csv',
    name: 'Comma Separated Values'
  },
  JSON: {
    extension: 'json',
    mimeType: 'application/json',
    name: 'JSON Data'
  }
};

// Feature Flags (for progressive rollout)
export const FEATURE_FLAGS = {
  ENABLE_PWA: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_REAL_TIME_SYNC: false,
  ENABLE_ADVANCED_REPORTING: false,
  ENABLE_MOBILE_APP_INTEGRATION: false,
  ENABLE_AI_TIME_PREDICTION: false,
  ENABLE_BIOMETRIC_AUTH: false
};

// Performance Thresholds
export const PERFORMANCE_TARGETS = {
  FIRST_CONTENTFUL_PAINT: 1500, // milliseconds
  TIME_TO_INTERACTIVE: 3000,
  LARGEST_CONTENTFUL_PAINT: 2500,
  CUMULATIVE_LAYOUT_SHIFT: 0.1,
  FIRST_INPUT_DELAY: 100
};

// Security Configuration
export const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  PASSWORD_MIN_LENGTH: 8,
  REQUIRE_2FA: false,
  ENABLE_AUDIT_LOGGING: true
};

// Environment-specific settings
export const ENV_CONFIG = {
  DEVELOPMENT: {
    DEBUG_MODE: true,
    LOG_LEVEL: 'debug',
    ENABLE_MOCK_DATA: true,
    SKIP_AUTH: true
  },
  
  PRODUCTION: {
    DEBUG_MODE: false,
    LOG_LEVEL: 'error',
    ENABLE_MOCK_DATA: false,
    SKIP_AUTH: false,
    ENABLE_COMPRESSION: true,
    ENABLE_CACHING: true
  }
};

// Browser Support
export const BROWSER_SUPPORT = {
  MINIMUM_VERSIONS: {
    chrome: 80,
    firefox: 75,
    safari: 13,
    edge: 80
  },
  
  REQUIRED_FEATURES: [
    'es6',
    'webworkers',
    'localstorage',
    'indexeddb',
    'fetch',
    'promise'
  ]
};

// Default Values
export const DEFAULTS = {
  WORK_TYPE: 'REGULAR',
  BREAK_HOURS: 0,
  PAGE_SIZE: 25,
  DATE_RANGE_DAYS: 7,
  CURRENCY: 'USD',
  TIMEZONE: 'America/Los_Angeles',
  LANGUAGE: 'en-US'
};