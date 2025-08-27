/**
 * Jest Test Setup for MasTec Timesheet System
 * Global test configuration and mocks
 */

// Polyfills for jsdom environment
import 'whatwg-fetch';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.sessionStorage = sessionStorageMock;

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  callback
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock MutationObserver
global.MutationObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn()
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock navigator
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: jest.fn(() => Promise.resolve()),
    ready: Promise.resolve({
      unregister: jest.fn(() => Promise.resolve(true))
    })
  },
  writable: true
});

// Mock console methods for clean test output
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  // Only show errors in tests if they're not expected
  if (!args[0]?.includes?.('Warning:') && !args[0]?.includes?.('Error:')) {
    originalError(...args);
  }
};

console.warn = (...args) => {
  // Suppress React warnings in tests
  if (!args[0]?.includes?.('Warning:')) {
    originalWarn(...args);
  }
};

// Global test utilities
global.testUtils = {
  // Create mock event
  createMockEvent: (type, props = {}) => {
    const event = new Event(type, { bubbles: true, cancelable: true });
    return Object.assign(event, props);
  },
  
  // Create mock form data
  createMockFormData: (data = {}) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  },
  
  // Async test helper
  waitFor: (condition, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 10);
        }
      };
      check();
    });
  },
  
  // Mock timesheet data
  mockTimesheetEntry: {
    id: 1,
    employeeId: 'EMP001',
    date: '2024-01-15',
    businessUnit: '220000',
    projectId: '22009017',
    jobId: 'J001',
    workOrderId: 'WO001',
    workType: 'REGULAR',
    costCode: 'ELEC-WIRE',
    hoursWorked: 8.0,
    breakHours: 0.5,
    description: 'Panel wiring work',
    approved: false
  },
  
  // Mock employee data
  mockEmployee: {
    id: 'EMP001',
    name: 'John Smith',
    role: 'Field Technician',
    businessUnit: '220000',
    active: true
  },
  
  // Mock project data
  mockProject: {
    id: '22009017',
    name: 'Industrial Controls Upgrade',
    businessUnit: '220000',
    status: 'Active'
  }
};

// Test environment configuration
process.env.NODE_ENV = 'test';
process.env.TZ = 'America/Los_Angeles';

// Global beforeEach for all tests
beforeEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset localStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // Reset sessionStorage
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
  
  // Reset DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

// Global afterEach for all tests
afterEach(() => {
  // Clean up any timers
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection in tests:', reason);
});

// Export test utilities for use in individual test files
export { testUtils };
export default {};