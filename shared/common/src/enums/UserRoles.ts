/**
 * User roles in the education platform
 */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SCHOOL_ADMIN = 'SCHOOL_ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  SUPPORT_STAFF = 'SUPPORT_STAFF'
}

/**
 * Permissions available in the system
 */
export enum Permission {
  // User Management
  CREATE_USERS = 'CREATE_USERS',
  READ_USERS = 'READ_USERS',
  UPDATE_USERS = 'UPDATE_USERS',
  DELETE_USERS = 'DELETE_USERS',
  
  // Content Management
  CREATE_CONTENT = 'CREATE_CONTENT',
  READ_CONTENT = 'READ_CONTENT',
  UPDATE_CONTENT = 'UPDATE_CONTENT',
  DELETE_CONTENT = 'DELETE_CONTENT',
  PUBLISH_CONTENT = 'PUBLISH_CONTENT',
  
  // AI Tools
  ACCESS_AI_TOOLS = 'ACCESS_AI_TOOLS',
  GENERATE_LESSON_PLANS = 'GENERATE_LESSON_PLANS',
  GENERATE_ASSESSMENTS = 'GENERATE_ASSESSMENTS',
  GENERATE_WORKSHEETS = 'GENERATE_WORKSHEETS',
  
  // Student Management
  VIEW_STUDENT_PROGRESS = 'VIEW_STUDENT_PROGRESS',
  UPDATE_STUDENT_PROGRESS = 'UPDATE_STUDENT_PROGRESS',
  ACCESS_STUDENT_TOOLS = 'ACCESS_STUDENT_TOOLS',
  INTERACT_WITH_AI_SAFELY = 'INTERACT_WITH_AI_SAFELY',
  
  // Analytics and Reports
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  EXPORT_DATA = 'EXPORT_DATA',
  GENERATE_REPORTS = 'GENERATE_REPORTS',
  
  // System Administration
  MANAGE_SCHOOL_SETTINGS = 'MANAGE_SCHOOL_SETTINGS',
  MANAGE_INTEGRATIONS = 'MANAGE_INTEGRATIONS',
  VIEW_SYSTEM_LOGS = 'VIEW_SYSTEM_LOGS',
  MANAGE_API_KEYS = 'MANAGE_API_KEYS'
}

/**
 * Role-Permission mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  
  [UserRole.SCHOOL_ADMIN]: [
    Permission.CREATE_USERS,
    Permission.READ_USERS,
    Permission.UPDATE_USERS,
    Permission.CREATE_CONTENT,
    Permission.READ_CONTENT,
    Permission.UPDATE_CONTENT,
    Permission.DELETE_CONTENT,
    Permission.PUBLISH_CONTENT,
    Permission.VIEW_STUDENT_PROGRESS,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
    Permission.GENERATE_REPORTS,
    Permission.MANAGE_SCHOOL_SETTINGS,
    Permission.MANAGE_INTEGRATIONS
  ],
  
  [UserRole.TEACHER]: [
    Permission.READ_USERS,
    Permission.CREATE_CONTENT,
    Permission.READ_CONTENT,
    Permission.UPDATE_CONTENT,
    Permission.ACCESS_AI_TOOLS,
    Permission.GENERATE_LESSON_PLANS,
    Permission.GENERATE_ASSESSMENTS,
    Permission.GENERATE_WORKSHEETS,
    Permission.VIEW_STUDENT_PROGRESS,
    Permission.UPDATE_STUDENT_PROGRESS,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA
  ],
  
  [UserRole.STUDENT]: [
    Permission.READ_CONTENT,
    Permission.ACCESS_STUDENT_TOOLS,
    Permission.INTERACT_WITH_AI_SAFELY
  ],
  
  [UserRole.PARENT]: [
    Permission.READ_CONTENT,
    Permission.VIEW_STUDENT_PROGRESS
  ],
  
  [UserRole.SUPPORT_STAFF]: [
    Permission.READ_USERS,
    Permission.READ_CONTENT,
    Permission.VIEW_ANALYTICS
  ]
};