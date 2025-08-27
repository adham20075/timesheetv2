/**
 * Rollup Configuration for MasTec Timesheet System
 * Following PROJECT_BLUEPRINT.md performance and scalability requirements
 */

import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import html from '@rollup/plugin-html';
import json from '@rollup/plugin-json';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

// HTML template for the application
const htmlTemplate = ({ attributes, files, meta, publicPath, title }) => {
  const scripts = (files.js || [])
    .map(({ fileName }) => `<script type="module" src="${publicPath}${fileName}"></script>`)
    .join('\\n');
  
  const links = (files.css || [])
    .map(({ fileName }) => `<link rel="stylesheet" href="${publicPath}${fileName}">`)
    .join('\\n');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="MasTec Advanced Timesheet Management System">
  <meta name="author" content="MasTec Development Team">
  
  <!-- Security headers -->
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;">
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="X-Frame-Options" content="DENY">
  
  <!-- PWA manifest -->
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#0056b3">
  
  <!-- Icons -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/icon-192.png">
  
  <title>${title || 'MasTec Timesheet System'}</title>
  ${links}
</head>
<body>
  <!-- Application container -->
  <div id="app" role="main">
    <!-- Loading screen -->
    <div id="loading-screen" class="loading-screen">
      <div class="loading-spinner"></div>
      <p>Loading MasTec Timesheet System...</p>
    </div>
    
    <!-- Main navigation -->
    <nav id="main-nav" class="main-nav" role="navigation">
      <div class="nav-container">
        <div class="nav-brand">
          <h1>MasTec Timesheet</h1>
          <span class="nav-subtitle">Henkels West Controls</span>
        </div>
        <div class="nav-menu">
          <a href="#timesheet" class="nav-link active">Timesheet Entry</a>
          <a href="#approval" class="nav-link">Approvals</a>
          <a href="#reports" class="nav-link">Reports</a>
          <a href="#settings" class="nav-link">Settings</a>
        </div>
        <div class="nav-user">
          <span id="current-user" class="user-name">User</span>
          <button id="logout-btn" class="btn btn-secondary">Logout</button>
        </div>
      </div>
    </nav>
    
    <!-- Main content area -->
    <main id="main-content" class="main-content">
      <!-- Dynamic content will be inserted here -->
    </main>
    
    <!-- Status bar -->
    <div id="status-bar" class="status-bar">
      <div class="status-left">
        <span id="connection-status" class="status-indicator">●</span>
        <span id="sync-status">Ready</span>
      </div>
      <div class="status-right">
        <span id="last-saved">Auto-saved</span>
      </div>
    </div>
  </div>
  
  <!-- Error boundary -->
  <div id="error-boundary" class="error-boundary hidden">
    <div class="error-content">
      <h2>Oops! Something went wrong</h2>
      <p id="error-message">An unexpected error occurred. Please try refreshing the page.</p>
      <div class="error-actions">
        <button id="error-reload" class="btn btn-primary">Reload Page</button>
        <button id="error-report" class="btn btn-secondary">Report Issue</button>
      </div>
    </div>
  </div>
  
  <!-- Notification container -->
  <div id="notifications" class="notifications-container" aria-live="polite"></div>
  
  <!-- Scripts -->
  ${scripts}
  
  <!-- Service Worker registration -->
  <script>
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('SW registered:', registration))
        .catch(error => console.log('SW registration failed:', error));
    }
  </script>
</body>
</html>
  `.trim();
};

export default {
  input: 'src/index.js',
  
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: isDevelopment,
    chunkFileNames: 'chunks/[name]-[hash].js',
    entryFileNames: '[name]-[hash].js',
    assetFileNames: 'assets/[name]-[hash][extname]',
    
    // Performance optimization
    manualChunks: {
      // Vendor chunk for external dependencies
      vendor: ['@libsql/client'],
      
      // Service layer chunk
      services: [
        'src/services/database.js',
        'src/services/validation.js'
      ],
      
      // Utilities chunk
      utils: [
        'src/utils/formatters.js',
        'src/utils/constants.js',
        'src/utils/helpers.js'
      ],
      
      // Data chunk
      data: ['src/data/dropdown-data.js']
    }
  },
  
  plugins: [
    // Resolve Node modules
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    
    // Convert CommonJS modules
    commonjs(),
    
    // Handle JSON imports
    json(),
    
    // Generate HTML file
    html({
      title: 'MasTec Advanced Timesheet System',
      template: htmlTemplate,
      publicPath: '/',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }),
    
    // Minify in production
    isProduction && terser({
      compress: {
        dead_code: true,
        drop_console: true,
        drop_debugger: true,
        passes: 2
      },
      mangle: {
        properties: false
      },
      format: {
        comments: false
      }
    })
  ].filter(Boolean),
  
  // External dependencies (don't bundle these)
  external: [],
  
  // Watch mode settings
  watch: {
    include: 'src/**',
    exclude: 'node_modules/**',
    clearScreen: false
  },
  
  // Performance settings
  treeshake: {
    preset: 'smallest',
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false
  },
  
  // Rollup context
  context: 'window',
  
  // Handle warnings
  onwarn(warning, warn) {
    // Skip certain warnings
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    
    // Use default for everything else
    warn(warning);
  }
};