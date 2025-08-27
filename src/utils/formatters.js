/**
 * Data Formatting Utilities for MasTec Timesheet System
 * Consistent data formatting across the application
 * Following PROJECT_BLUEPRINT.md guidelines
 */

/**
 * Format hours for display with proper decimal places
 * @param {number|string} hours - Hours to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted hours string
 */
export function formatHours(hours, decimals = 2) {
  try {
    const numHours = typeof hours === 'string' ? parseFloat(hours) : hours;
    if (isNaN(numHours)) return '0.00';
    
    return numHours.toFixed(decimals);
  } catch (error) {
    console.error('Error formatting hours:', error);
    return '0.00';
  }
}

/**
 * Format currency values with proper symbols and decimals
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency symbol (default: '$')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = '$') {
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return `${currency}0.00`;
    
    return `${currency}${numAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currency}0.00`;
  }
}

/**
 * Format dates for consistent display
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'iso')
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'short') {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';

    switch (format) {
      case 'long':
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'iso':
        return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
      case 'display':
        return dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      case 'short':
      default:
        return dateObj.toLocaleDateString('en-US'); // MM/DD/YYYY
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

/**
 * Format time for display
 * @param {string|Date} time - Time to format
 * @param {boolean} includeSeconds - Include seconds in output
 * @returns {string} Formatted time string
 */
export function formatTime(time, includeSeconds = false) {
  try {
    const timeObj = typeof time === 'string' ? new Date(time) : time;
    if (isNaN(timeObj.getTime())) return 'Invalid Time';

    const options = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };

    if (includeSeconds) {
      options.second = '2-digit';
    }

    return timeObj.toLocaleTimeString('en-US', options);
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
}

/**
 * Format employee names consistently
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @param {string} format - Format type ('full', 'last-first', 'initials')
 * @returns {string} Formatted name
 */
export function formatEmployeeName(firstName, lastName, format = 'full') {
  try {
    const first = (firstName || '').trim();
    const last = (lastName || '').trim();

    switch (format) {
      case 'last-first':
        return `${last}, ${first}`;
      case 'initials':
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
      case 'full':
      default:
        return `${first} ${last}`.trim();
    }
  } catch (error) {
    console.error('Error formatting name:', error);
    return 'Unknown Employee';
  }
}

/**
 * Format full employee name from single name string
 * @param {string} fullName - Full name string
 * @param {string} format - Format type
 * @returns {string} Formatted name
 */
export function formatFullName(fullName, format = 'full') {
  try {
    if (!fullName) return 'Unknown Employee';
    
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length < 2) return fullName;

    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    
    return formatEmployeeName(firstName, lastName, format);
  } catch (error) {
    console.error('Error formatting full name:', error);
    return fullName || 'Unknown Employee';
  }
}

/**
 * Format business unit display
 * @param {string} code - Business unit code
 * @param {string} name - Business unit name
 * @param {string} format - Format type ('code-name', 'name-only', 'code-only')
 * @returns {string} Formatted business unit
 */
export function formatBusinessUnit(code, name, format = 'code-name') {
  try {
    switch (format) {
      case 'name-only':
        return name || code || 'Unknown Unit';
      case 'code-only':
        return code || 'Unknown Code';
      case 'code-name':
      default:
        return code && name ? `${code} - ${name}` : code || name || 'Unknown Unit';
    }
  } catch (error) {
    console.error('Error formatting business unit:', error);
    return 'Unknown Unit';
  }
}

/**
 * Format project display with hierarchical information
 * @param {Object} project - Project object
 * @param {string} format - Format type ('full', 'name-only', 'id-name')
 * @returns {string} Formatted project string
 */
export function formatProject(project, format = 'id-name') {
  try {
    if (!project) return 'Unknown Project';

    const { id, name, businessUnit, customer } = project;

    switch (format) {
      case 'full':
        return `${id} - ${name} (${businessUnit} | ${customer})`;
      case 'name-only':
        return name || id || 'Unknown Project';
      case 'id-name':
      default:
        return id && name ? `${id} - ${name}` : id || name || 'Unknown Project';
    }
  } catch (error) {
    console.error('Error formatting project:', error);
    return 'Unknown Project';
  }
}

/**
 * Format percentage values
 * @param {number|string} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 1) {
  try {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '0.0%';
    
    return `${(numValue * 100).toFixed(decimals)}%`;
  } catch (error) {
    console.error('Error formatting percentage:', error);
    return '0.0%';
  }
}

/**
 * Format file sizes for display
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes, decimals = 2) {
  try {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  } catch (error) {
    console.error('Error formatting file size:', error);
    return '0 Bytes';
  }
}

/**
 * Format phone numbers consistently
 * @param {string} phoneNumber - Raw phone number
 * @param {string} format - Format type ('us', 'international', 'digits-only')
 * @returns {string} Formatted phone number
 */
export function formatPhoneNumber(phoneNumber, format = 'us') {
  try {
    if (!phoneNumber) return '';
    
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    switch (format) {
      case 'international':
        if (digits.length === 11 && digits.startsWith('1')) {
          return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
        }
        return phoneNumber;
      case 'digits-only':
        return digits;
      case 'us':
      default:
        if (digits.length === 10) {
          return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        } else if (digits.length === 11 && digits.startsWith('1')) {
          return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
        }
        return phoneNumber;
    }
  } catch (error) {
    console.error('Error formatting phone number:', error);
    return phoneNumber || '';
  }
}

/**
 * Format work order display
 * @param {Object} workOrder - Work order object
 * @param {string} format - Format type ('full', 'id-description', 'description-only')
 * @returns {string} Formatted work order string
 */
export function formatWorkOrder(workOrder, format = 'id-description') {
  try {
    if (!workOrder) return 'No Work Order';

    const { id, description, costCode, priority } = workOrder;

    switch (format) {
      case 'full':
        return `${id} - ${description} (${costCode} | ${priority})`;
      case 'description-only':
        return description || id || 'Unknown Work Order';
      case 'id-description':
      default:
        return id && description ? `${id} - ${description}` : id || description || 'Unknown Work Order';
    }
  } catch (error) {
    console.error('Error formatting work order:', error);
    return 'Unknown Work Order';
  }
}

/**
 * Format duration from hours to human readable format
 * @param {number} hours - Duration in hours
 * @param {string} format - Format type ('long', 'short', 'minimal')
 * @returns {string} Formatted duration string
 */
export function formatDuration(hours, format = 'short') {
  try {
    const numHours = typeof hours === 'string' ? parseFloat(hours) : hours;
    if (isNaN(numHours) || numHours < 0) return '0h';

    const wholeHours = Math.floor(numHours);
    const minutes = Math.round((numHours - wholeHours) * 60);

    switch (format) {
      case 'long':
        if (wholeHours === 0) {
          return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else if (minutes === 0) {
          return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''}`;
        } else {
          return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        }
      case 'minimal':
        if (wholeHours === 0) {
          return `${minutes}m`;
        } else if (minutes === 0) {
          return `${wholeHours}h`;
        } else {
          return `${wholeHours}h${minutes}m`;
        }
      case 'short':
      default:
        if (wholeHours === 0) {
          return `${minutes} min`;
        } else if (minutes === 0) {
          return `${wholeHours}h`;
        } else {
          return `${wholeHours}h ${minutes}min`;
        }
    }
  } catch (error) {
    console.error('Error formatting duration:', error);
    return '0h';
  }
}

/**
 * Format approval status for display
 * @param {boolean|string} approved - Approval status
 * @param {boolean|string} rejected - Rejection status
 * @returns {Object} Formatted status object with text and CSS class
 */
export function formatApprovalStatus(approved, rejected) {
  try {
    if (rejected || rejected === 'true') {
      return {
        text: 'Rejected',
        class: 'status-rejected',
        color: '#dc3545'
      };
    } else if (approved || approved === 'true') {
      return {
        text: 'Approved',
        class: 'status-approved',
        color: '#28a745'
      };
    } else {
      return {
        text: 'Pending',
        class: 'status-pending',
        color: '#ffc107'
      };
    }
  } catch (error) {
    console.error('Error formatting approval status:', error);
    return {
      text: 'Unknown',
      class: 'status-unknown',
      color: '#6c757d'
    };
  }
}

/**
 * Sanitize text for HTML display
 * @param {string} text - Text to sanitize
 * @param {boolean} preserveLineBreaks - Convert line breaks to <br> tags
 * @returns {string} Sanitized text
 */
export function sanitizeText(text, preserveLineBreaks = false) {
  try {
    if (!text) return '';
    
    let sanitized = String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    if (preserveLineBreaks) {
      sanitized = sanitized.replace(/\n/g, '<br>');
    }

    return sanitized;
  } catch (error) {
    console.error('Error sanitizing text:', error);
    return String(text || '');
  }
}

/**
 * Format error messages for user display
 * @param {Error|string} error - Error object or message
 * @param {string} context - Context where error occurred
 * @returns {string} Formatted error message
 */
export function formatErrorMessage(error, context = '') {
  try {
    let message = '';
    
    if (error instanceof Error) {
      message = error.message;
    } else {
      message = String(error);
    }

    // Remove technical details that users don't need to see
    message = message.replace(/^Error:\s*/, '');
    message = message.replace(/\n\s*at\s+.*$/s, ''); // Remove stack traces
    
    if (context) {
      return `${context}: ${message}`;
    }
    
    return message;
  } catch (err) {
    console.error('Error formatting error message:', err);
    return 'An unexpected error occurred';
  }
}