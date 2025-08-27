/**
 * Data Validation Service for MasTec Timesheet System
 * Comprehensive validation rules following PROJECT_BLUEPRINT.md
 * Error-first development approach with user-friendly messages
 */

import { 
  isValidBusinessUnit, 
  isValidEmployee, 
  isValidProject, 
  isValidCostCode, 
  isValidWorkType,
  getProjectDetails,
  workTypes
} from '../data/dropdown-data.js';

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {string[]} errors - Array of error messages
 * @property {string[]} warnings - Array of warning messages
 * @property {Object} sanitized - Sanitized data object
 */

class ValidationService {
  constructor() {
    this.rules = new Map();
    this.setupValidationRules();
  }

  /**
   * Setup validation rules for different data types
   */
  setupValidationRules() {
    // Employee validation rules
    this.rules.set('employee', {
      required: ['id', 'name', 'role', 'businessUnit'],
      validators: {
        id: (value) => this.validateEmployeeId(value),
        name: (value) => this.validateName(value),
        role: (value) => this.validateRole(value),
        businessUnit: (value) => this.validateBusinessUnitCode(value),
        payGrade: (value) => this.validatePayGrade(value)
      }
    });

    // Timesheet entry validation rules
    this.rules.set('timesheet_entry', {
      required: ['employeeId', 'date', 'businessUnit', 'projectId', 'hoursWorked'],
      validators: {
        employeeId: (value) => this.validateEmployeeId(value),
        date: (value) => this.validateDate(value),
        businessUnit: (value) => this.validateBusinessUnitCode(value),
        projectId: (value) => this.validateProjectId(value),
        hoursWorked: (value) => this.validateHours(value),
        breakHours: (value) => this.validateBreakHours(value),
        workType: (value) => this.validateWorkType(value),
        costCode: (value) => this.validateCostCode(value),
        description: (value) => this.validateDescription(value)
      }
    });

    // Project validation rules
    this.rules.set('project', {
      required: ['id', 'name', 'businessUnit', 'contractType'],
      validators: {
        id: (value) => this.validateProjectId(value),
        name: (value) => this.validateProjectName(value),
        businessUnit: (value) => this.validateBusinessUnitCode(value),
        contractType: (value) => this.validateContractType(value),
        startDate: (value) => this.validateDate(value),
        endDate: (value) => this.validateDate(value)
      }
    });
  }

  /**
   * Main validation method for any data type
   * @param {string} type - Data type to validate
   * @param {Object} data - Data object to validate
   * @returns {ValidationResult}
   */
  validate(type, data) {
    try {
      const rules = this.rules.get(type);
      if (!rules) {
        return {
          isValid: false,
          errors: [`Unknown validation type: ${type}`],
          warnings: [],
          sanitized: data
        };
      }

      const errors = [];
      const warnings = [];
      const sanitized = { ...data };

      // Check required fields
      for (const field of rules.required) {
        if (!data[field] || data[field] === '') {
          errors.push(`${this.formatFieldName(field)} is required`);
        }
      }

      // Run field validators
      for (const [field, validator] of Object.entries(rules.validators)) {
        if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
          const result = validator(data[field]);
          
          if (!result.isValid) {
            errors.push(...result.errors);
          }
          
          if (result.warnings && result.warnings.length > 0) {
            warnings.push(...result.warnings);
          }
          
          // Apply sanitization if provided
          if (result.sanitized !== undefined) {
            sanitized[field] = result.sanitized;
          }
        }
      }

      // Run cross-field validation
      const crossValidation = this.validateCrossFields(type, sanitized);
      errors.push(...crossValidation.errors);
      warnings.push(...crossValidation.warnings);

      return {
        isValid: errors.length === 0,
        errors: [...new Set(errors)], // Remove duplicates
        warnings: [...new Set(warnings)],
        sanitized
      };

    } catch (error) {
      console.error('❌ Validation service error:', error);
      return {
        isValid: false,
        errors: ['Validation service error occurred'],
        warnings: [],
        sanitized: data
      };
    }
  }

  /**
   * Validate employee ID format and existence
   * @param {string} employeeId - Employee ID to validate
   */
  validateEmployeeId(employeeId) {
    const errors = [];
    let sanitized = employeeId;

    if (typeof employeeId !== 'string') {
      errors.push('Employee ID must be a string');
      return { isValid: false, errors, sanitized };
    }

    // Sanitize: trim and uppercase
    sanitized = employeeId.trim().toUpperCase();

    // Format validation
    if (!/^EMP\d{3,}$/.test(sanitized)) {
      errors.push('Employee ID must be in format EMP### (e.g., EMP001)');
    }

    // Existence validation
    if (!isValidEmployee(sanitized)) {
      errors.push('Employee ID not found in system');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Validate person name
   * @param {string} name - Name to validate
   */
  validateName(name) {
    const errors = [];
    let sanitized = name;

    if (typeof name !== 'string') {
      errors.push('Name must be a string');
      return { isValid: false, errors, sanitized };
    }

    // Sanitize: trim and proper case
    sanitized = name.trim().replace(/\s+/g, ' ');
    sanitized = sanitized.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    if (sanitized.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (sanitized.length > 100) {
      errors.push('Name cannot exceed 100 characters');
    }

    if (!/^[a-zA-Z\s\-'\.]+$/.test(sanitized)) {
      errors.push('Name can only contain letters, spaces, hyphens, apostrophes, and periods');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Validate employee role
   * @param {string} role - Role to validate
   */
  validateRole(role) {
    const errors = [];
    const warnings = [];
    let sanitized = role;

    const validRoles = [
      'Field Technician', 'Senior Technician', 'Lead Technician',
      'Electrician', 'Senior Electrician', 'Master Electrician',
      'Controls Engineer', 'Senior Engineer', 'Principal Engineer',
      'Project Manager', 'Senior Project Manager',
      'Field Supervisor', 'Operations Manager', 'Division Manager'
    ];

    if (typeof role !== 'string') {
      errors.push('Role must be a string');
      return { isValid: false, errors, warnings, sanitized };
    }

    sanitized = role.trim();

    if (!validRoles.includes(sanitized)) {
      warnings.push(`Role "${sanitized}" is not in the standard role list`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitized
    };
  }

  /**
   * Validate business unit code
   * @param {string} code - Business unit code to validate
   */
  validateBusinessUnitCode(code) {
    const errors = [];
    let sanitized = code;

    if (typeof code !== 'string') {
      errors.push('Business unit code must be a string');
      return { isValid: false, errors, sanitized };
    }

    sanitized = code.trim();

    if (!/^\d{6}$/.test(sanitized)) {
      errors.push('Business unit code must be 6 digits (e.g., 220000)');
    }

    if (!isValidBusinessUnit(sanitized)) {
      errors.push('Business unit code not found in system');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Validate project ID
   * @param {string} projectId - Project ID to validate
   */
  validateProjectId(projectId) {
    const errors = [];
    let sanitized = projectId;

    if (typeof projectId !== 'string') {
      errors.push('Project ID must be a string');
      return { isValid: false, errors, sanitized };
    }

    sanitized = projectId.trim();

    if (!/^\d{8}$/.test(sanitized)) {
      errors.push('Project ID must be 8 digits (e.g., 22009017)');
    }

    if (!isValidProject(sanitized)) {
      errors.push('Project ID not found or inactive');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Validate date format and range
   * @param {string} date - Date to validate (YYYY-MM-DD)
   */
  validateDate(date) {
    const errors = [];
    const warnings = [];
    let sanitized = date;

    if (typeof date !== 'string') {
      errors.push('Date must be a string');
      return { isValid: false, errors, warnings, sanitized };
    }

    sanitized = date.trim();

    // Format validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(sanitized)) {
      errors.push('Date must be in YYYY-MM-DD format');
      return { isValid: false, errors, warnings, sanitized };
    }

    const dateObj = new Date(sanitized);
    
    // Valid date check
    if (isNaN(dateObj.getTime())) {
      errors.push('Invalid date');
      return { isValid: false, errors, warnings, sanitized };
    }

    // Business rule validations
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (dateObj < oneYearAgo) {
      errors.push('Date cannot be more than one year in the past');
    }

    if (dateObj > thirtyDaysFromNow) {
      errors.push('Date cannot be more than 30 days in the future');
    }

    // Weekend warning for business days
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      warnings.push('Date falls on a weekend');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitized
    };
  }

  /**
   * Validate hours worked
   * @param {number|string} hours - Hours to validate
   */
  validateHours(hours) {
    const errors = [];
    const warnings = [];
    let sanitized = hours;

    // Convert to number
    if (typeof hours === 'string') {
      sanitized = parseFloat(hours.trim());
    }

    if (typeof sanitized !== 'number' || isNaN(sanitized)) {
      errors.push('Hours must be a valid number');
      return { isValid: false, errors, warnings, sanitized: 0 };
    }

    // Round to 2 decimal places
    sanitized = Math.round(sanitized * 100) / 100;

    if (sanitized < 0) {
      errors.push('Hours cannot be negative');
    }

    if (sanitized > 24) {
      errors.push('Hours cannot exceed 24 per day');
    }

    if (sanitized > 16) {
      warnings.push('Unusually high hours - please verify');
    }

    // Quarter hour validation
    const quarterHours = sanitized * 4;
    if (Math.abs(quarterHours - Math.round(quarterHours)) > 0.001) {
      warnings.push('Hours should be in 15-minute increments (0.25)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitized
    };
  }

  /**
   * Validate break hours
   * @param {number|string} breakHours - Break hours to validate
   */
  validateBreakHours(breakHours) {
    const errors = [];
    const warnings = [];
    let sanitized = breakHours || 0;

    // Convert to number
    if (typeof breakHours === 'string') {
      sanitized = parseFloat(breakHours.trim()) || 0;
    }

    if (typeof sanitized !== 'number' || isNaN(sanitized)) {
      sanitized = 0;
    }

    // Round to 2 decimal places
    sanitized = Math.round(sanitized * 100) / 100;

    if (sanitized < 0) {
      errors.push('Break hours cannot be negative');
    }

    if (sanitized > 4) {
      errors.push('Break hours cannot exceed 4 hours per day');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitized
    };
  }

  /**
   * Validate work type
   * @param {string} workType - Work type to validate
   */
  validateWorkType(workType) {
    const errors = [];
    let sanitized = workType || 'REGULAR';

    if (typeof workType === 'string') {
      sanitized = workType.trim().toUpperCase();
    }

    if (!isValidWorkType(sanitized)) {
      errors.push('Invalid work type');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Validate cost code
   * @param {string} costCode - Cost code to validate
   */
  validateCostCode(costCode) {
    const errors = [];
    let sanitized = costCode;

    if (!costCode) {
      return { isValid: true, errors, sanitized: null };
    }

    if (typeof costCode === 'string') {
      sanitized = costCode.trim().toUpperCase();
    }

    if (!isValidCostCode(sanitized)) {
      errors.push('Cost code not found in system');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Validate description text
   * @param {string} description - Description to validate
   */
  validateDescription(description) {
    const errors = [];
    const warnings = [];
    let sanitized = description || '';

    if (typeof description === 'string') {
      sanitized = description.trim();
    }

    if (sanitized.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }

    if (sanitized.length === 0) {
      warnings.push('Description is empty - consider adding details');
    }

    // Basic sanitization - remove potentially dangerous characters
    sanitized = sanitized.replace(/[<>]/g, '');

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitized
    };
  }

  /**
   * Cross-field validation for complex business rules
   * @param {string} type - Data type
   * @param {Object} data - Sanitized data object
   */
  validateCrossFields(type, data) {
    const errors = [];
    const warnings = [];

    if (type === 'timesheet_entry') {
      // Validate total hours don't exceed daily limits
      const totalHours = (data.hoursWorked || 0) + (data.breakHours || 0);
      if (totalHours > 24) {
        errors.push('Total work and break hours cannot exceed 24 hours per day');
      }

      // Validate project dates
      if (data.projectId && data.date) {
        const project = getProjectDetails(data.projectId);
        if (project) {
          const entryDate = new Date(data.date);
          const startDate = new Date(project.startDate);
          const endDate = new Date(project.endDate);

          if (entryDate < startDate) {
            errors.push(`Date is before project start date (${project.startDate})`);
          }

          if (entryDate > endDate) {
            warnings.push(`Date is after project end date (${project.endDate})`);
          }
        }
      }

      // Validate overtime rules
      if (data.workType === 'OVERTIME' && (data.hoursWorked || 0) <= 8) {
        warnings.push('Overtime work type selected but hours are 8 or less');
      }

      if (data.workType === 'DOUBLETIME' && (data.hoursWorked || 0) <= 12) {
        warnings.push('Double time work type selected but hours are 12 or less');
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate pay grade
   * @param {string} payGrade - Pay grade to validate
   */
  validatePayGrade(payGrade) {
    const errors = [];
    const warnings = [];
    let sanitized = payGrade;

    const validGrades = ['T1', 'T2', 'T3', 'T4', 'E1', 'E2', 'E3', 'E4', 'S1', 'S2', 'M1', 'M2', 'M3'];

    if (payGrade && typeof payGrade === 'string') {
      sanitized = payGrade.trim().toUpperCase();

      if (!validGrades.includes(sanitized)) {
        warnings.push(`Pay grade "${sanitized}" is not in the standard grade list`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitized
    };
  }

  /**
   * Validate contract type
   * @param {string} contractType - Contract type to validate
   */
  validateContractType(contractType) {
    const errors = [];
    let sanitized = contractType;

    const validTypes = ['Time & Materials', 'Fixed Bid', 'Unit Price'];

    if (typeof contractType !== 'string') {
      errors.push('Contract type must be a string');
      return { isValid: false, errors, sanitized };
    }

    sanitized = contractType.trim();

    if (!validTypes.includes(sanitized)) {
      errors.push('Invalid contract type. Must be: Time & Materials, Fixed Bid, or Unit Price');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Validate project name
   * @param {string} name - Project name to validate
   */
  validateProjectName(name) {
    const errors = [];
    let sanitized = name;

    if (typeof name !== 'string') {
      errors.push('Project name must be a string');
      return { isValid: false, errors, sanitized };
    }

    sanitized = name.trim();

    if (sanitized.length < 3) {
      errors.push('Project name must be at least 3 characters long');
    }

    if (sanitized.length > 200) {
      errors.push('Project name cannot exceed 200 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Format field names for user-friendly error messages
   * @param {string} fieldName - Field name to format
   */
  formatFieldName(fieldName) {
    const nameMap = {
      'employeeId': 'Employee ID',
      'businessUnit': 'Business Unit',
      'projectId': 'Project ID',
      'hoursWorked': 'Hours Worked',
      'breakHours': 'Break Hours',
      'workType': 'Work Type',
      'costCode': 'Cost Code',
      'contractType': 'Contract Type',
      'payGrade': 'Pay Grade'
    };

    return nameMap[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }

  /**
   * Quick validation for single fields
   * @param {string} fieldType - Type of field to validate
   * @param {any} value - Value to validate
   */
  validateField(fieldType, value) {
    const validators = {
      email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      phone: (val) => /^\+?[\d\s\-\(\)]{10,}$/.test(val),
      ssn: (val) => /^\d{3}-\d{2}-\d{4}$/.test(val),
      time: (val) => /^([01]?\d|2[0-3]):[0-5]\d$/.test(val)
    };

    const validator = validators[fieldType];
    if (validator) {
      return validator(value);
    }

    return true; // Unknown field types pass validation
  }
}

// Export singleton instance
export const validationService = new ValidationService();
export default validationService;