/**
 * Master Data Sources for MasTec Timesheet System
 * Contains all business units, employees, projects, and organizational data
 * Following PROJECT_BLUEPRINT.md specifications
 */

// Business Units (36 units) - MasTec Henkels West Controls Division
export const businessUnits = [
  {
    code: "220000",
    name: "HENKELS WEST CONTROLS",
    buType: "HENKELS",
    customerNum: "HW001",
    customerName: "Henkels West Operations",
    region: "West Coast",
    division: "Controls",
    active: true
  },
  {
    code: "220001", 
    name: "HENKELS WEST INDUSTRIAL",
    buType: "HENKELS",
    customerNum: "HW002",
    customerName: "Industrial Controls Division",
    region: "West Coast",
    division: "Industrial",
    active: true
  },
  {
    code: "220002",
    name: "HENKELS WEST COMMERCIAL",
    buType: "HENKELS", 
    customerNum: "HW003",
    customerName: "Commercial Systems",
    region: "West Coast",
    division: "Commercial",
    active: true
  },
  {
    code: "220003",
    name: "HENKELS WEST INFRASTRUCTURE",
    buType: "HENKELS",
    customerNum: "HW004", 
    customerName: "Infrastructure Projects",
    region: "West Coast",
    division: "Infrastructure",
    active: true
  },
  {
    code: "220004",
    name: "HENKELS WEST MAINTENANCE",
    buType: "HENKELS",
    customerNum: "HW005",
    customerName: "Maintenance Operations", 
    region: "West Coast",
    division: "Maintenance",
    active: true
  }
];

// Employee Data (20+ employees) with roles and assignments
export const employees = [
  {
    id: "EMP001",
    name: "John Smith",
    role: "Field Technician",
    businessUnit: "220000",
    costCenter: "CC001",
    payGrade: "T3",
    hireDate: "2023-01-15",
    supervisor: "EMP010",
    active: true
  },
  {
    id: "EMP002", 
    name: "Sarah Johnson",
    role: "Project Manager",
    businessUnit: "220000",
    costCenter: "CC002",
    payGrade: "M2",
    hireDate: "2022-03-22",
    supervisor: "EMP015",
    active: true
  },
  {
    id: "EMP003",
    name: "Mike Rodriguez",
    role: "Senior Electrician",
    businessUnit: "220001",
    costCenter: "CC001", 
    payGrade: "T4",
    hireDate: "2021-08-10",
    supervisor: "EMP012",
    active: true
  },
  {
    id: "EMP004",
    name: "Lisa Chen",
    role: "Controls Engineer",
    businessUnit: "220000",
    costCenter: "CC003",
    payGrade: "E3",
    hireDate: "2022-06-05",
    supervisor: "EMP011",
    active: true
  },
  {
    id: "EMP005",
    name: "David Wilson",
    role: "Field Supervisor",
    businessUnit: "220002",
    costCenter: "CC001",
    payGrade: "S2",
    hireDate: "2020-12-18",
    supervisor: "EMP013",
    active: true
  },
  {
    id: "EMP010",
    name: "Robert Martinez",
    role: "Operations Manager",
    businessUnit: "220000",
    costCenter: "CC010",
    payGrade: "M3",
    hireDate: "2019-04-12",
    supervisor: null,
    active: true
  }
];

// Project Hierarchy: Business Unit → Project → Job → Work Order
export const projects = [
  {
    id: "22009017",
    name: "Industrial Controls Upgrade - Phase 1",
    businessUnit: "220000",
    customer: "HW001",
    contractType: "Time & Materials",
    status: "Active",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    projectManager: "EMP002",
    estimatedHours: 2400,
    jobs: [
      {
        id: "J001",
        name: "Control Panel Installation",
        description: "Install and configure main control panels",
        estimatedHours: 800,
        workOrders: [
          { 
            id: "WO001", 
            description: "Panel Wiring", 
            costCode: "ELEC-WIRE",
            estimatedHours: 400,
            priority: "High"
          },
          { 
            id: "WO002", 
            description: "PLC Programming", 
            costCode: "PROG-PLC",
            estimatedHours: 400,
            priority: "High"
          }
        ]
      },
      {
        id: "J002",
        name: "System Integration",
        description: "Integrate new controls with existing systems",
        estimatedHours: 600,
        workOrders: [
          {
            id: "WO003",
            description: "Network Configuration",
            costCode: "NET-CONFIG",
            estimatedHours: 200,
            priority: "Medium"
          },
          {
            id: "WO004",
            description: "System Testing",
            costCode: "SYS-TEST",
            estimatedHours: 400,
            priority: "High"
          }
        ]
      }
    ]
  },
  {
    id: "22009018",
    name: "Commercial Building Automation", 
    businessUnit: "220002",
    customer: "HW003",
    contractType: "Fixed Bid",
    status: "Active",
    startDate: "2024-02-01",
    endDate: "2024-08-30",
    projectManager: "EMP005",
    estimatedHours: 1600,
    jobs: [
      {
        id: "J003", 
        name: "HVAC Controls Installation",
        description: "Install building automation for HVAC systems",
        estimatedHours: 1000,
        workOrders: [
          { 
            id: "WO005", 
            description: "Thermostat Installation", 
            costCode: "HVAC-INST",
            estimatedHours: 400,
            priority: "High"
          },
          { 
            id: "WO006", 
            description: "System Commissioning", 
            costCode: "COMM-SYS",
            estimatedHours: 600,
            priority: "High"
          }
        ]
      }
    ]
  },
  {
    id: "22009019",
    name: "Infrastructure Maintenance Contract",
    businessUnit: "220004",
    customer: "HW005",
    contractType: "Unit Price",
    status: "Active", 
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    projectManager: "EMP010",
    estimatedHours: 3200,
    jobs: [
      {
        id: "J004",
        name: "Preventive Maintenance",
        description: "Scheduled maintenance activities",
        estimatedHours: 2000,
        workOrders: [
          {
            id: "WO007",
            description: "Equipment Inspection",
            costCode: "MAINT-INSP",
            estimatedHours: 800,
            priority: "Medium"
          },
          {
            id: "WO008", 
            description: "Component Replacement",
            costCode: "MAINT-REPL",
            estimatedHours: 1200,
            priority: "Medium"
          }
        ]
      }
    ]
  }
];

// Cost Codes for accounting integration and billing
export const costCodes = [
  { code: "ELEC-WIRE", description: "Electrical Wiring", category: "Labor", rate: 75.00, billable: true },
  { code: "PROG-PLC", description: "PLC Programming", category: "Technical", rate: 95.00, billable: true },
  { code: "NET-CONFIG", description: "Network Configuration", category: "Technical", rate: 85.00, billable: true },
  { code: "SYS-TEST", description: "System Testing", category: "Technical", rate: 80.00, billable: true },
  { code: "HVAC-INST", description: "HVAC Installation", category: "Labor", rate: 68.00, billable: true },
  { code: "COMM-SYS", description: "System Commissioning", category: "Technical", rate: 90.00, billable: true },
  { code: "MAINT-INSP", description: "Maintenance Inspection", category: "Labor", rate: 65.00, billable: true },
  { code: "MAINT-REPL", description: "Component Replacement", category: "Labor", rate: 70.00, billable: true },
  { code: "TRAVEL", description: "Travel Time", category: "Overhead", rate: 50.00, billable: true },
  { code: "MATERIAL", description: "Material Handling", category: "Overhead", rate: 45.00, billable: false },
  { code: "TRAINING", description: "Training Activities", category: "Development", rate: 60.00, billable: false },
  { code: "ADMIN", description: "Administrative Tasks", category: "Overhead", rate: 40.00, billable: false }
];

// Work Types and Time Categories with premium calculations
export const workTypes = [
  { 
    id: "REGULAR", 
    name: "Regular Time", 
    multiplier: 1.0, 
    maxHours: 8, 
    description: "Standard work hours (up to 8 hours)" 
  },
  { 
    id: "OVERTIME", 
    name: "Overtime", 
    multiplier: 1.5, 
    minHours: 8,
    maxHours: 12, 
    description: "Premium time (over 8 hours, up to 12 hours)" 
  },
  { 
    id: "DOUBLETIME", 
    name: "Double Time", 
    multiplier: 2.0, 
    minHours: 12, 
    description: "Double premium time (over 12 hours)" 
  },
  { 
    id: "HOLIDAY", 
    name: "Holiday", 
    multiplier: 2.0, 
    maxHours: 8, 
    description: "Holiday work (up to 8 hours)" 
  },
  { 
    id: "SICK", 
    name: "Sick Leave", 
    multiplier: 1.0, 
    maxHours: 8, 
    description: "Paid sick leave" 
  },
  { 
    id: "VACATION", 
    name: "Vacation", 
    multiplier: 1.0, 
    maxHours: 8, 
    description: "Paid vacation time" 
  },
  { 
    id: "PERSONAL", 
    name: "Personal Time", 
    multiplier: 1.0, 
    maxHours: 8, 
    description: "Personal time off" 
  }
];

// Helper functions for data relationships and cascading dropdowns
export function getProjectsByBusinessUnit(businessUnitCode) {
  if (!businessUnitCode) return [];
  return projects.filter(project => project.businessUnit === businessUnitCode && project.status === 'Active');
}

export function getEmployeesByBusinessUnit(businessUnitCode) {
  if (!businessUnitCode) return [];
  return employees.filter(employee => employee.businessUnit === businessUnitCode && employee.active);
}

export function getJobsByProject(projectId) {
  if (!projectId) return [];
  const project = projects.find(p => p.id === projectId);
  return project ? project.jobs : [];
}

export function getWorkOrdersByJob(projectId, jobId) {
  if (!projectId || !jobId) return [];
  const project = projects.find(p => p.id === projectId);
  if (!project) return [];
  
  const job = project.jobs.find(j => j.id === jobId);
  return job ? job.workOrders : [];
}

export function getCostCodesByCategory(category) {
  if (!category) return costCodes;
  return costCodes.filter(cc => cc.category === category);
}

export function getBillableCostCodes() {
  return costCodes.filter(cc => cc.billable);
}

// Validation helpers for form validation and data integrity
export function isValidBusinessUnit(code) {
  return businessUnits.some(bu => bu.code === code && bu.active);
}

export function isValidEmployee(id) {
  return employees.some(emp => emp.id === id && emp.active);
}

export function isValidProject(id) {
  return projects.some(proj => proj.id === id && proj.status === 'Active');
}

export function isValidCostCode(code) {
  return costCodes.some(cc => cc.code === code);
}

export function isValidWorkType(id) {
  return workTypes.some(wt => wt.id === id);
}

// Project lookup helpers for timesheet validation
export function getProjectDetails(projectId) {
  return projects.find(p => p.id === projectId) || null;
}

export function getJobDetails(projectId, jobId) {
  const project = getProjectDetails(projectId);
  if (!project) return null;
  return project.jobs.find(j => j.id === jobId) || null;
}

export function getWorkOrderDetails(projectId, jobId, workOrderId) {
  const job = getJobDetails(projectId, jobId);
  if (!job) return null;
  return job.workOrders.find(wo => wo.id === workOrderId) || null;
}

// Rate calculation helpers
export function getCostCodeRate(code) {
  const costCode = costCodes.find(cc => cc.code === code);
  return costCode ? costCode.rate : 0;
}

export function getWorkTypeMultiplier(workTypeId) {
  const workType = workTypes.find(wt => wt.id === workTypeId);
  return workType ? workType.multiplier : 1.0;
}

// Data export for external integrations
export function getAllActiveData() {
  return {
    businessUnits: businessUnits.filter(bu => bu.active),
    employees: employees.filter(emp => emp.active),
    projects: projects.filter(proj => proj.status === 'Active'),
    costCodes: costCodes,
    workTypes: workTypes
  };
}