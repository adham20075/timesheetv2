/**
 * Main Application Entry Point for MasTec Timesheet System
 * Following PROJECT_BLUEPRINT.md progressive enhancement principles
 * Error-first development approach with graceful degradation
 */

import { db } from './services/database.js';
import { validationService } from './services/validation.js';
import { APP_INFO, FEATURE_FLAGS, UI_CONFIG } from './utils/constants.js';
import { formatErrorMessage } from './utils/formatters.js';

class TimesheetApplication {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
    this.currentView = 'timesheet';
    this.components = new Map();
    this.eventListeners = new Map();
    
    // Bind methods to preserve context
    this.handleError = this.handleError.bind(this);
    this.handleNavigation = this.handleNavigation.bind(this);
    this.handleUnload = this.handleUnload.bind(this);
  }

  /**
   * Initialize the application
   * Progressive enhancement: start with basic functionality
   */
  async initialize() {
    try {
      console.log(`🚀 Initializing ${APP_INFO.name} v${APP_INFO.version}`);
      
      // Set up error handling first (error-first development)
      this.setupErrorHandling();
      
      // Initialize core services
      await this.initializeServices();
      
      // Set up UI components with progressive enhancement
      this.initializeUI();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize routing
      this.initializeRouting();
      
      // Mark as initialized
      this.isInitialized = true;
      
      // Load initial view
      await this.loadInitialView();
      
      console.log('✅ Application initialized successfully');
      this.showNotification('Application loaded successfully', 'success');
      
    } catch (error) {
      this.handleError(error, 'Application initialization failed');
    }
  }

  /**
   * Set up comprehensive error handling
   */
  setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'JavaScript Error');
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'Unhandled Promise Rejection');
      event.preventDefault();
    });

    // Setup error boundary in DOM
    const errorBoundary = document.getElementById('error-boundary');
    if (errorBoundary) {
      const reloadBtn = errorBoundary.querySelector('#error-reload');
      const reportBtn = errorBoundary.querySelector('#error-report');
      
      if (reloadBtn) {
        reloadBtn.addEventListener('click', () => window.location.reload());
      }
      
      if (reportBtn) {
        reportBtn.addEventListener('click', () => this.reportError());
      }
    }
  }

  /**
   * Initialize core services
   */
  async initializeServices() {
    try {
      // Initialize database with error handling
      await db.initialize();
      console.log('✅ Database service initialized');
      
      // Health check
      const health = await db.healthCheck();
      if (!health.healthy) {
        throw new Error(`Database health check failed: ${health.error}`);
      }
      
      // Initialize validation service
      console.log('✅ Validation service initialized');
      
    } catch (error) {
      console.error('❌ Service initialization failed:', error);
      throw new Error(`Service initialization failed: ${error.message}`);
    }
  }

  /**
   * Initialize UI components with progressive enhancement
   */
  initializeUI() {
    try {
      // Hide loading screen
      this.hideLoadingScreen();
      
      // Initialize navigation
      this.initializeNavigation();
      
      // Initialize status bar
      this.initializeStatusBar();
      
      // Set up theme and accessibility
      this.initializeTheme();
      this.initializeAccessibility();
      
      console.log('✅ UI components initialized');
      
    } catch (error) {
      console.error('❌ UI initialization failed:', error);
      this.showErrorBoundary('UI initialization failed');
    }
  }

  /**
   * Hide loading screen with animation
   */
  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 300);
    }
  }

  /**
   * Initialize navigation system
   */
  initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('href').substring(1);
        this.navigateToView(view);
      });
    });
  }

  /**
   * Initialize status bar
   */
  initializeStatusBar() {
    const connectionStatus = document.getElementById('connection-status');
    const syncStatus = document.getElementById('sync-status');
    
    if (connectionStatus) {
      // Set initial connection status
      connectionStatus.className = 'status-indicator online';
      connectionStatus.title = 'Connected';
    }
    
    if (syncStatus) {
      syncStatus.textContent = 'Ready';
    }
    
    // Update last saved time
    this.updateLastSavedTime();
  }

  /**
   * Initialize theme and visual settings
   */
  initializeTheme() {
    // Set CSS custom properties for theming
    const root = document.documentElement;
    const theme = UI_CONFIG.THEME_COLORS;
    
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }

  /**
   * Initialize accessibility features
   */
  initializeAccessibility() {
    // Skip link for keyboard navigation
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to main content';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Focus management
    this.setupFocusManagement();
    
    // Screen reader announcements
    this.setupScreenReaderSupport();
  }

  /**
   * Setup focus management for accessibility
   */
  setupFocusManagement() {
    // Trap focus in modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      }
      
      if (e.key === 'Escape') {
        this.handleEscapeKey(e);
      }
    });
  }

  /**
   * Setup screen reader support
   */
  setupScreenReaderSupport() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.id = 'sr-announcements';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    document.body.appendChild(liveRegion);
  }

  /**
   * Set up global event listeners
   */
  setupEventListeners() {
    // Navigation events
    window.addEventListener('hashchange', this.handleNavigation);
    window.addEventListener('beforeunload', this.handleUnload);
    
    // Online/offline status
    window.addEventListener('online', () => this.handleConnectionChange(true));
    window.addEventListener('offline', () => this.handleConnectionChange(false));
    
    // Visibility change (for pause/resume functionality)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handleApplicationPause();
      } else {
        this.handleApplicationResume();
      }
    });
  }

  /**
   * Initialize client-side routing
   */
  initializeRouting() {
    // Define routes
    this.routes = {
      'timesheet': () => this.loadTimesheetView(),
      'approval': () => this.loadApprovalView(),
      'reports': () => this.loadReportsView(),
      'settings': () => this.loadSettingsView()
    };
    
    // Set initial route
    const hash = window.location.hash.substring(1) || 'timesheet';
    this.currentView = this.routes[hash] ? hash : 'timesheet';
  }

  /**
   * Load initial view based on URL hash
   */
  async loadInitialView() {
    try {
      const hash = window.location.hash.substring(1) || 'timesheet';
      await this.navigateToView(hash);
    } catch (error) {
      console.error('❌ Failed to load initial view:', error);
      await this.navigateToView('timesheet'); // Fallback to timesheet
    }
  }

  /**
   * Navigate to a specific view
   * @param {string} viewName - Name of the view to navigate to
   */
  async navigateToView(viewName) {
    try {
      if (!this.routes[viewName]) {
        throw new Error(`Unknown view: ${viewName}`);
      }
      
      // Update navigation state
      this.updateNavigationState(viewName);
      
      // Update URL hash
      window.location.hash = viewName;
      
      // Load the view
      await this.routes[viewName]();
      
      // Update current view
      this.currentView = viewName;
      
      // Announce to screen readers
      this.announceViewChange(viewName);
      
    } catch (error) {
      this.handleError(error, `Failed to navigate to ${viewName}`);
    }
  }

  /**
   * Update navigation visual state
   * @param {string} activeView - Currently active view
   */
  updateNavigationState(activeView) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href').substring(1);
      if (href === activeView) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Load timesheet entry view
   */
  async loadTimesheetView() {
    try {
      const mainContent = document.getElementById('main-content');
      mainContent.innerHTML = `
        <div class="view-container">
          <header class="view-header">
            <h2>Timesheet Entry</h2>
            <div class="view-actions">
              <button id="new-entry-btn" class="btn btn-primary">New Entry</button>
              <button id="save-timesheet-btn" class="btn btn-success">Save Timesheet</button>
            </div>
          </header>
          <div id="timesheet-content" class="view-content">
            <p>Loading timesheet...</p>
          </div>
        </div>
      `;
      
      // Initialize timesheet components (will be implemented in next phase)
      console.log('📋 Timesheet view loaded');
      
    } catch (error) {
      this.handleError(error, 'Failed to load timesheet view');
    }
  }

  /**
   * Load approval view
   */
  async loadApprovalView() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
      <div class="view-container">
        <header class="view-header">
          <h2>Timesheet Approvals</h2>
        </header>
        <div class="view-content">
          <p>Approval functionality will be implemented in Phase 2</p>
        </div>
      </div>
    `;
  }

  /**
   * Load reports view
   */
  async loadReportsView() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
      <div class="view-container">
        <header class="view-header">
          <h2>Reports & Analytics</h2>
        </header>
        <div class="view-content">
          <p>Reporting functionality will be implemented in Phase 2</p>
        </div>
      </div>
    `;
  }

  /**
   * Load settings view
   */
  async loadSettingsView() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
      <div class="view-container">
        <header class="view-header">
          <h2>Settings</h2>
        </header>
        <div class="view-content">
          <p>Settings functionality will be implemented in Phase 2</p>
        </div>
      </div>
    `;
  }

  /**
   * Handle navigation events
   */
  handleNavigation() {
    const hash = window.location.hash.substring(1) || 'timesheet';
    if (hash !== this.currentView && this.routes[hash]) {
      this.navigateToView(hash);
    }
  }

  /**
   * Handle application errors with user-friendly display
   * @param {Error} error - The error that occurred
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = 'Application Error') {
    console.error(`❌ ${context}:`, error);
    
    const errorMessage = formatErrorMessage(error, context);
    this.showNotification(errorMessage, 'error');
    
    // For critical errors, show error boundary
    if (context.includes('initialization') || context.includes('critical')) {
      this.showErrorBoundary(errorMessage);
    }
  }

  /**
   * Show error boundary for critical errors
   * @param {string} message - Error message to display
   */
  showErrorBoundary(message) {
    const errorBoundary = document.getElementById('error-boundary');
    const errorMessage = document.getElementById('error-message');
    
    if (errorBoundary && errorMessage) {
      errorMessage.textContent = message;
      errorBoundary.classList.remove('hidden');
    }
  }

  /**
   * Show notification to user
   * @param {string} message - Message to display
   * @param {string} type - Notification type (success, error, warning, info)
   */
  showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
      <span class="notification-message">${message}</span>
      <button class="notification-close" aria-label="Close notification">&times;</button>
    `;
    
    // Auto-dismiss after configured time
    const dismissTime = UI_CONFIG[`${type.toUpperCase()}_NOTIFICATION_DURATION`] || 3000;
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, dismissTime);
    
    // Manual dismiss
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => notification.remove());
    
    container.appendChild(notification);
  }

  /**
   * Handle connection status changes
   * @param {boolean} isOnline - Whether the application is online
   */
  handleConnectionChange(isOnline) {
    const connectionStatus = document.getElementById('connection-status');
    const syncStatus = document.getElementById('sync-status');
    
    if (connectionStatus) {
      connectionStatus.className = `status-indicator ${isOnline ? 'online' : 'offline'}`;
      connectionStatus.title = isOnline ? 'Connected' : 'Offline';
    }
    
    if (syncStatus) {
      syncStatus.textContent = isOnline ? 'Connected' : 'Offline';
    }
    
    this.showNotification(
      isOnline ? 'Connection restored' : 'Working offline',
      isOnline ? 'success' : 'warning'
    );
  }

  /**
   * Update last saved time display
   */
  updateLastSavedTime() {
    const lastSaved = document.getElementById('last-saved');
    if (lastSaved) {
      const now = new Date();
      lastSaved.textContent = `Saved at ${now.toLocaleTimeString()}`;
    }
  }

  /**
   * Handle application pause (when tab becomes inactive)
   */
  handleApplicationPause() {
    console.log('📱 Application paused');
    // Save any unsaved data
    // Pause timers or periodic tasks
  }

  /**
   * Handle application resume (when tab becomes active)
   */
  handleApplicationResume() {
    console.log('📱 Application resumed');
    // Resume timers or periodic tasks
    // Sync any pending changes
  }

  /**
   * Handle application unload (page close/refresh)
   */
  handleUnload(event) {
    // Save any unsaved data
    // Clean up resources
    console.log('📴 Application unloading');
  }

  /**
   * Handle tab key navigation for accessibility
   */
  handleTabNavigation(event) {
    // Implementation for focus trap in modals
    const modal = document.querySelector('.modal.active');
    if (modal) {
      this.trapFocusInModal(event, modal);
    }
  }

  /**
   * Handle escape key for closing modals
   */
  handleEscapeKey(event) {
    const modal = document.querySelector('.modal.active');
    if (modal) {
      this.closeModal(modal);
    }
  }

  /**
   * Announce view changes to screen readers
   */
  announceViewChange(viewName) {
    const liveRegion = document.getElementById('sr-announcements');
    if (liveRegion) {
      liveRegion.textContent = `Navigated to ${viewName} view`;
    }
  }

  /**
   * Report error to support (placeholder for future implementation)
   */
  reportError() {
    const email = APP_INFO.supportEmail;
    const subject = encodeURIComponent('Timesheet System Error Report');
    const body = encodeURIComponent(`
      Please describe what you were doing when the error occurred:
      
      
      
      Technical Details:
      - Browser: ${navigator.userAgent}
      - Timestamp: ${new Date().toISOString()}
      - App Version: ${APP_INFO.version}
    `);
    
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
  }

  /**
   * Get application status for debugging
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      currentView: this.currentView,
      currentUser: this.currentUser,
      componentsLoaded: Array.from(this.components.keys()),
      version: APP_INFO.version
    };
  }
}

// Initialize application when DOM is ready
async function initializeApp() {
  try {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }
    
    // Create and initialize application
    const app = new TimesheetApplication();
    await app.initialize();
    
    // Make app globally available for debugging
    if (process.env.NODE_ENV !== 'production') {
      window.timesheetApp = app;
    }
    
  } catch (error) {
    console.error('💥 Critical application error:', error);
    
    // Show basic error message if app fails to start
    const errorHtml = `
      <div style="padding: 2rem; text-align: center; color: #dc3545;">
        <h2>Application Failed to Start</h2>
        <p>Please refresh the page or contact support if the problem persists.</p>
        <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
    
    const mainContent = document.getElementById('main-content') || document.body;
    mainContent.innerHTML = errorHtml;
  }
}

// Start the application
initializeApp();

export { TimesheetApplication };