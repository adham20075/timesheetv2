/**
 * Jest Configuration for MasTec Timesheet System
 * Following PROJECT_BLUEPRINT.md testing strategy
 */

export default {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Module settings
  moduleFileExtensions: ['js', 'json'],
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1'
  },
  
  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/src/**/*.test.js'
  ],
  
  // Setup and teardown
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Coverage settings (80% minimum as per blueprint)
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/data/dropdown-data.js', // Static data file
    '!src/index.js' // Entry point
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Critical service files need higher coverage
    './src/services/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Transform settings
  transform: {
    '^.+\\.js$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', {
          targets: { node: 'current' },
          modules: 'commonjs'
        }]
      ]
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@libsql)/)'
  ],
  
  // Mock settings
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Performance
  maxWorkers: '50%',
  testTimeout: 10000,
  
  // Error handling
  bail: 0, // Continue testing after failures
  verbose: true,
  
  // Global variables
  globals: {
    'NODE_ENV': 'test'
  },
  
  // Reporter configuration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit.xml'
    }]
  ],
  
  // Watch mode (for development)
  watchman: true,
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/'
  ]
};