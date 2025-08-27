/**
 * Database Service Layer for MasTec Timesheet System
 * Handles all database operations with error handling and validation
 * Following PROJECT_BLUEPRINT.md specifications for serverless SQLite strategy
 */

import { createClient } from '@libsql/client';

class DatabaseService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.schema_version = '1.0.0';
  }

  /**
   * Initialize database connection with error-first approach
   * @param {Object} config - Database configuration
   */
  async initialize(config = {}) {
    try {
      // Default to local SQLite for development, serverless for production
      const dbConfig = {
        url: config.url || process.env.LIBSQL_URL || 'file:mastec-timesheet.db',
        authToken: config.authToken || process.env.LIBSQL_AUTH_TOKEN || null,
        ...config
      };

      this.client = createClient(dbConfig);
      await this.createTables();
      await this.seedInitialData();
      this.isInitialized = true;
      
      console.log('✅ Database initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw new Error(`Failed to initialize database: ${error.message}`);
    }
  }

  /**
   * Create database tables if they don't exist - following enterprise schema design
   */
  async createTables() {
    const tables = [
      // Business Units table
      `CREATE TABLE IF NOT EXISTS business_units (
        code TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        bu_type TEXT NOT NULL,
        customer_num TEXT,
        customer_name TEXT,
        region TEXT,
        division TEXT,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Employees table with full organizational hierarchy
      `CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        business_unit TEXT NOT NULL,
        cost_center TEXT,
        pay_grade TEXT,
        hire_date TEXT,
        supervisor TEXT,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_unit) REFERENCES business_units(code),
        FOREIGN KEY (supervisor) REFERENCES employees(id)
      )`,

      // Projects table with contract tracking
      `CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        business_unit TEXT NOT NULL,
        customer TEXT,
        contract_type TEXT CHECK (contract_type IN ('Time & Materials', 'Fixed Bid', 'Unit Price')),
        status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'On Hold', 'Completed', 'Cancelled')),
        start_date TEXT,
        end_date TEXT,
        project_manager TEXT,
        estimated_hours INTEGER DEFAULT 0,
        actual_hours INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_unit) REFERENCES business_units(code),
        FOREIGN KEY (project_manager) REFERENCES employees(id)
      )`,

      // Jobs table for project breakdown
      `CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        estimated_hours INTEGER DEFAULT 0,
        actual_hours INTEGER DEFAULT 0,
        status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'On Hold', 'Completed', 'Cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )`,

      // Work Orders table for detailed task tracking
      `CREATE TABLE IF NOT EXISTS work_orders (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        description TEXT NOT NULL,
        cost_code TEXT,
        estimated_hours INTEGER DEFAULT 0,
        actual_hours INTEGER DEFAULT 0,
        priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
        status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Completed', 'Cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
      )`,

      // Cost Codes table for accounting integration
      `CREATE TABLE IF NOT EXISTS cost_codes (
        code TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        rate REAL NOT NULL DEFAULT 0.00,
        billable BOOLEAN DEFAULT 1,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Work Types for time categorization
      `CREATE TABLE IF NOT EXISTS work_types (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        multiplier REAL NOT NULL DEFAULT 1.0,
        min_hours INTEGER DEFAULT 0,
        max_hours INTEGER DEFAULT 24,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Main timesheet entries table with comprehensive tracking
      `CREATE TABLE IF NOT EXISTS timesheet_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id TEXT NOT NULL,
        date TEXT NOT NULL,
        business_unit TEXT NOT NULL,
        project_id TEXT NOT NULL,
        job_id TEXT,
        work_order_id TEXT,
        work_type TEXT DEFAULT 'REGULAR',
        cost_code TEXT,
        hours_worked REAL NOT NULL CHECK (hours_worked >= 0 AND hours_worked <= 24),
        break_hours REAL DEFAULT 0 CHECK (break_hours >= 0),
        description TEXT,
        billable_hours REAL GENERATED ALWAYS AS (
          CASE WHEN cost_code IN (SELECT code FROM cost_codes WHERE billable = 1) 
               THEN hours_worked 
               ELSE 0 END
        ) STORED,
        calculated_rate REAL DEFAULT 0.00,
        total_cost REAL DEFAULT 0.00,
        approved BOOLEAN DEFAULT 0,
        approved_by TEXT,
        approved_at DATETIME,
        rejected BOOLEAN DEFAULT 0,
        rejection_reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id),
        FOREIGN KEY (business_unit) REFERENCES business_units(code),
        FOREIGN KEY (project_id) REFERENCES projects(id),
        FOREIGN KEY (job_id) REFERENCES jobs(id),
        FOREIGN KEY (work_order_id) REFERENCES work_orders(id),
        FOREIGN KEY (work_type) REFERENCES work_types(id),
        FOREIGN KEY (cost_code) REFERENCES cost_codes(code),
        FOREIGN KEY (approved_by) REFERENCES employees(id),
        UNIQUE(employee_id, date, project_id, job_id, work_order_id, work_type)
      )`,

      // Audit trail for all changes
      `CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
        old_values TEXT,
        new_values TEXT,
        user_id TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // System settings and configuration
      `CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    // Create indexes for performance
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_timesheet_employee_date ON timesheet_entries(employee_id, date)`,
      `CREATE INDEX IF NOT EXISTS idx_timesheet_project ON timesheet_entries(project_id)`,
      `CREATE INDEX IF NOT EXISTS idx_timesheet_approval ON timesheet_entries(approved, approved_by)`,
      `CREATE INDEX IF NOT EXISTS idx_employees_business_unit ON employees(business_unit)`,
      `CREATE INDEX IF NOT EXISTS idx_projects_business_unit ON projects(business_unit)`,
      `CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_log(table_name, record_id)`
    ];

    try {
      for (const tableSQL of tables) {
        await this.execute(tableSQL);
      }
      
      for (const indexSQL of indexes) {
        await this.execute(indexSQL);
      }
      
      console.log('✅ Database tables and indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating database tables:', error);
      throw error;
    }
  }

  /**
   * Seed initial data from dropdown-data.js
   */
  async seedInitialData() {
    try {
      // Import data dynamically to avoid circular dependencies
      const { businessUnits, employees, projects, costCodes, workTypes } = 
        await import('../data/dropdown-data.js');

      // Seed business units
      for (const bu of businessUnits) {
        await this.insertOrIgnore('business_units', bu);
      }

      // Seed employees
      for (const emp of employees) {
        await this.insertOrIgnore('employees', emp);
      }

      // Seed cost codes
      for (const cc of costCodes) {
        await this.insertOrIgnore('cost_codes', cc);
      }

      // Seed work types
      for (const wt of workTypes) {
        await this.insertOrIgnore('work_types', wt);
      }

      // Seed projects with jobs and work orders
      for (const project of projects) {
        const { jobs, ...projectData } = project;
        await this.insertOrIgnore('projects', projectData);
        
        if (jobs) {
          for (const job of jobs) {
            const { workOrders, ...jobData } = job;
            jobData.project_id = project.id;
            await this.insertOrIgnore('jobs', jobData);
            
            if (workOrders) {
              for (const wo of workOrders) {
                wo.job_id = job.id;
                await this.insertOrIgnore('work_orders', wo);
              }
            }
          }
        }
      }

      console.log('✅ Initial data seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding initial data:', error);
      // Don't throw here - seeding is optional for development
    }
  }

  /**
   * Execute a SQL statement with error handling
   * @param {string} sql - SQL statement
   * @param {Array} params - Parameters for the SQL statement
   */
  async execute(sql, params = []) {
    try {
      if (!this.isInitialized && !sql.includes('CREATE')) {
        throw new Error('Database not initialized');
      }
      
      const result = await this.client.execute({ sql, args: params });
      return result;
    } catch (error) {
      console.error('❌ Database execution error:', error);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }

  /**
   * Insert or ignore record (for seeding)
   * @param {string} table - Table name
   * @param {Object} data - Record data
   */
  async insertOrIgnore(table, data) {
    try {
      const columns = Object.keys(data);
      const placeholders = columns.map(() => '?').join(', ');
      const values = Object.values(data);

      const sql = `INSERT OR IGNORE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
      return await this.execute(sql, values);
    } catch (error) {
      console.error(`❌ Error inserting into ${table}:`, error);
      // Don't throw for seeding operations
      return false;
    }
  }

  /**
   * Get all records from a table with optional filtering
   * @param {string} table - Table name
   * @param {Object} filters - Filter conditions
   * @param {Object} options - Query options (limit, offset, orderBy)
   */
  async getAll(table, filters = {}, options = {}) {
    try {
      let sql = `SELECT * FROM ${table}`;
      const params = [];
      
      if (Object.keys(filters).length > 0) {
        const conditions = Object.keys(filters).map(key => {
          params.push(filters[key]);
          return `${key} = ?`;
        });
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      if (options.orderBy) {
        sql += ` ORDER BY ${options.orderBy}`;
      }

      if (options.limit) {
        sql += ` LIMIT ?`;
        params.push(options.limit);
      }

      if (options.offset) {
        sql += ` OFFSET ?`;
        params.push(options.offset);
      }

      const result = await this.execute(sql, params);
      return result.rows || [];
    } catch (error) {
      console.error(`❌ Error getting records from ${table}:`, error);
      return [];
    }
  }

  /**
   * Get timesheet entries with full join data
   * @param {Object} filters - Filter conditions
   * @param {Object} options - Query options
   */
  async getTimesheetEntries(filters = {}, options = {}) {
    try {
      let sql = `
        SELECT 
          te.*,
          e.name as employee_name,
          e.role as employee_role,
          bu.name as business_unit_name,
          p.name as project_name,
          p.contract_type,
          j.name as job_name,
          wo.description as work_order_description,
          cc.description as cost_code_description,
          cc.rate as cost_code_rate,
          cc.billable as cost_code_billable,
          wt.name as work_type_name,
          wt.multiplier as work_type_multiplier
        FROM timesheet_entries te
        LEFT JOIN employees e ON te.employee_id = e.id
        LEFT JOIN business_units bu ON te.business_unit = bu.code
        LEFT JOIN projects p ON te.project_id = p.id
        LEFT JOIN jobs j ON te.job_id = j.id
        LEFT JOIN work_orders wo ON te.work_order_id = wo.id
        LEFT JOIN cost_codes cc ON te.cost_code = cc.code
        LEFT JOIN work_types wt ON te.work_type = wt.id
      `;

      const params = [];
      const conditions = [];

      if (filters.employeeId) {
        conditions.push('te.employee_id = ?');
        params.push(filters.employeeId);
      }

      if (filters.date) {
        conditions.push('te.date = ?');
        params.push(filters.date);
      }

      if (filters.dateFrom) {
        conditions.push('te.date >= ?');
        params.push(filters.dateFrom);
      }

      if (filters.dateTo) {
        conditions.push('te.date <= ?');
        params.push(filters.dateTo);
      }

      if (filters.businessUnit) {
        conditions.push('te.business_unit = ?');
        params.push(filters.businessUnit);
      }

      if (filters.projectId) {
        conditions.push('te.project_id = ?');
        params.push(filters.projectId);
      }

      if (filters.approved !== undefined) {
        conditions.push('te.approved = ?');
        params.push(filters.approved ? 1 : 0);
      }

      if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }

      sql += ' ORDER BY te.date DESC, te.created_at DESC';

      if (options.limit) {
        sql += ` LIMIT ${options.limit}`;
      }

      const result = await this.execute(sql, params);
      return result.rows || [];
    } catch (error) {
      console.error('❌ Error getting timesheet entries:', error);
      return [];
    }
  }

  /**
   * Calculate timesheet totals and premium hours
   * @param {string} employeeId - Employee ID
   * @param {string} date - Date (YYYY-MM-DD)
   */
  async calculateDailyTotals(employeeId, date) {
    try {
      const sql = `
        SELECT 
          SUM(hours_worked) as total_hours,
          SUM(billable_hours) as total_billable,
          SUM(break_hours) as total_breaks,
          COUNT(*) as entry_count
        FROM timesheet_entries 
        WHERE employee_id = ? AND date = ?
      `;
      
      const result = await this.execute(sql, [employeeId, date]);
      const row = result.rows?.[0];
      
      if (!row) {
        return { total_hours: 0, total_billable: 0, total_breaks: 0, entry_count: 0 };
      }
      
      // Calculate premium time based on total hours
      const totalHours = parseFloat(row.total_hours) || 0;
      const regularHours = Math.min(totalHours, 8);
      const overtimeHours = Math.max(0, Math.min(totalHours - 8, 4));
      const doubletimeHours = Math.max(0, totalHours - 12);
      
      return {
        total_hours: totalHours,
        regular_hours: regularHours,
        overtime_hours: overtimeHours,
        doubletime_hours: doubletimeHours,
        total_billable: parseFloat(row.total_billable) || 0,
        total_breaks: parseFloat(row.total_breaks) || 0,
        entry_count: parseInt(row.entry_count) || 0
      };
    } catch (error) {
      console.error('❌ Error calculating daily totals:', error);
      return { total_hours: 0, total_billable: 0, total_breaks: 0, entry_count: 0 };
    }
  }

  /**
   * Insert a new record with audit logging
   * @param {string} table - Table name
   * @param {Object} data - Record data
   * @param {string} userId - User performing the action
   */
  async insert(table, data, userId = null) {
    try {
      const columns = Object.keys(data);
      const placeholders = columns.map(() => '?').join(', ');
      const values = Object.values(data);

      const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
      const result = await this.execute(sql, values);
      
      // Log the action
      if (result.insertId || result.changes > 0) {
        await this.logAudit(table, result.insertId || data.id, 'INSERT', null, data, userId);
      }
      
      return result.insertId || result.changes > 0;
    } catch (error) {
      console.error(`❌ Error inserting into ${table}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing record with audit logging
   * @param {string} table - Table name
   * @param {string} id - Record ID
   * @param {Object} data - Updated data
   * @param {string} userId - User performing the action
   */
  async update(table, id, data, userId = null) {
    try {
      // Get old record for audit
      const oldRecord = await this.getById(table, id);
      
      const columns = Object.keys(data);
      const setClause = columns.map(col => `${col} = ?`).join(', ');
      const values = [...Object.values(data), id];

      const sql = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      const result = await this.execute(sql, values);
      
      // Log the action
      if (result.changes > 0) {
        await this.logAudit(table, id, 'UPDATE', oldRecord, {...oldRecord, ...data}, userId);
      }
      
      return result.changes > 0;
    } catch (error) {
      console.error(`❌ Error updating record in ${table}:`, error);
      throw error;
    }
  }

  /**
   * Delete a record with audit logging
   * @param {string} table - Table name
   * @param {string} id - Record ID
   * @param {string} userId - User performing the action
   */
  async delete(table, id, userId = null) {
    try {
      // Get record for audit
      const record = await this.getById(table, id);
      
      const result = await this.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
      
      // Log the action
      if (result.changes > 0) {
        await this.logAudit(table, id, 'DELETE', record, null, userId);
      }
      
      return result.changes > 0;
    } catch (error) {
      console.error(`❌ Error deleting record from ${table}:`, error);
      throw error;
    }
  }

  /**
   * Get a single record by ID
   * @param {string} table - Table name
   * @param {string} id - Record ID
   */
  async getById(table, id) {
    try {
      const result = await this.execute(
        `SELECT * FROM ${table} WHERE id = ? LIMIT 1`,
        [id]
      );
      return result.rows?.[0] || null;
    } catch (error) {
      console.error(`❌ Error getting record from ${table}:`, error);
      return null;
    }
  }

  /**
   * Log audit trail
   * @param {string} tableName - Table name
   * @param {string} recordId - Record ID
   * @param {string} action - Action performed
   * @param {Object} oldValues - Old values
   * @param {Object} newValues - New values
   * @param {string} userId - User performing the action
   */
  async logAudit(tableName, recordId, action, oldValues, newValues, userId = null) {
    try {
      const auditData = {
        table_name: tableName,
        record_id: String(recordId),
        action: action,
        old_values: oldValues ? JSON.stringify(oldValues) : null,
        new_values: newValues ? JSON.stringify(newValues) : null,
        user_id: userId
      };
      
      await this.insertOrIgnore('audit_log', auditData);
    } catch (error) {
      console.error('❌ Error logging audit:', error);
      // Don't throw - audit logging shouldn't break main operations
    }
  }

  /**
   * Check database health and connectivity
   */
  async healthCheck() {
    try {
      const result = await this.execute('SELECT 1 as health');
      return { healthy: true, timestamp: new Date().toISOString() };
    } catch (error) {
      return { healthy: false, error: error.message, timestamp: new Date().toISOString() };
    }
  }

  /**
   * Close database connection
   */
  async close() {
    try {
      if (this.client && this.client.close) {
        await this.client.close();
        this.isInitialized = false;
        console.log('✅ Database connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing database:', error);
    }
  }
}

// Export singleton instance for application use
export const db = new DatabaseService();
export default db;