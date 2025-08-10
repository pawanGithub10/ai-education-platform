/**
 * Standardized error messages for the platform
 */
export const ErrorMessages = {
  // Authentication & Authorization
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_LOCKED: 'Account has been locked due to multiple failed login attempts',
    ACCOUNT_DISABLED: 'Account has been disabled',
    TOKEN_EXPIRED: 'Authentication token has expired',
    TOKEN_INVALID: 'Invalid authentication token',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to perform this action',
    UNAUTHORIZED: 'You are not authorized to access this resource',
    SESSION_EXPIRED: 'Your session has expired, please login again'
  },

  // Validation
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid phone number',
    PASSWORD_TOO_WEAK: 'Password does not meet security requirements',
    INVALID_UUID: 'Invalid ID format',
    INVALID_DATE: 'Invalid date format',
    VALUE_TOO_SHORT: 'Value is too short',
    VALUE_TOO_LONG: 'Value is too long',
    INVALID_FORMAT: 'Invalid format'
  },

  // User Management
  USER: {
    NOT_FOUND: 'User not found',
    EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
    PHONE_ALREADY_EXISTS: 'An account with this phone number already exists',
    CREATION_FAILED: 'Failed to create user account',
    UPDATE_FAILED: 'Failed to update user account',
    DELETE_FAILED: 'Failed to delete user account',
    SELF_DELETE_NOT_ALLOWED: 'You cannot delete your own account'
  },

  // Content Management
  CONTENT: {
    NOT_FOUND: 'Content not found',
    ACCESS_DENIED: 'You do not have access to this content',
    CREATION_FAILED: 'Failed to create content',
    UPDATE_FAILED: 'Failed to update content',
    DELETE_FAILED: 'Failed to delete content',
    INVALID_CONTENT_TYPE: 'Invalid content type',
    CONTENT_TOO_LARGE: 'Content exceeds maximum size limit',
    CURRICULUM_MISMATCH: 'Content does not match the specified curriculum standards'
  },

  // AI Services
  AI: {
    GENERATION_FAILED: 'Failed to generate AI content',
    PROVIDER_UNAVAILABLE: 'AI service provider is currently unavailable',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded for AI service',
    INVALID_PROMPT: 'Invalid prompt provided',
    CONTENT_FILTERED: 'Generated content was filtered due to policy violations',
    QUOTA_EXCEEDED: 'AI usage quota exceeded',
    MODEL_NOT_AVAILABLE: 'Requested AI model is not available'
  },

  // File Operations
  FILE: {
    NOT_FOUND: 'File not found',
    UPLOAD_FAILED: 'File upload failed',
    DOWNLOAD_FAILED: 'File download failed',
    INVALID_FILE_TYPE: 'Invalid file type',
    FILE_TOO_LARGE: 'File size exceeds limit',
    STORAGE_FULL: 'Storage quota exceeded',
    VIRUS_DETECTED: 'File contains malicious content'
  },

  // Database
  DATABASE: {
    CONNECTION_FAILED: 'Failed to connect to database',
    QUERY_FAILED: 'Database query failed',
    TRANSACTION_FAILED: 'Database transaction failed',
    CONSTRAINT_VIOLATION: 'Database constraint violation',
    DUPLICATE_ENTRY: 'Duplicate entry detected',
    FOREIGN_KEY_VIOLATION: 'Foreign key constraint violation'
  },

  // External Services
  EXTERNAL: {
    SERVICE_UNAVAILABLE: 'External service is currently unavailable',
    INTEGRATION_FAILED: 'Failed to integrate with external service',
    API_LIMIT_EXCEEDED: 'External API rate limit exceeded',
    AUTHENTICATION_FAILED: 'Failed to authenticate with external service'
  },

  // System
  SYSTEM: {
    INTERNAL_ERROR: 'An internal error occurred',
    SERVICE_UNAVAILABLE: 'Service is currently unavailable',
    MAINTENANCE_MODE: 'System is under maintenance',
    CONFIGURATION_ERROR: 'System configuration error',
    RESOURCE_NOT_FOUND: 'Requested resource not found',
    OPERATION_NOT_SUPPORTED: 'Operation not supported'
  },

  // Network
  NETWORK: {
    CONNECTION_TIMEOUT: 'Connection timeout',
    CONNECTION_REFUSED: 'Connection refused',
    DNS_RESOLUTION_FAILED: 'DNS resolution failed',
    NETWORK_UNREACHABLE: 'Network unreachable'
  },

  // Education Specific
  EDUCATION: {
    INVALID_GRADE: 'Invalid grade level specified',
    INVALID_SUBJECT: 'Invalid subject specified',
    INVALID_CURRICULUM: 'Invalid curriculum standard specified',
    ASSESSMENT_CREATION_FAILED: 'Failed to create assessment',
    LESSON_PLAN_GENERATION_FAILED: 'Failed to generate lesson plan',
    STUDENT_NOT_ENROLLED: 'Student is not enrolled in this class',
    TEACHER_NOT_ASSIGNED: 'Teacher is not assigned to this class'
  }
} as const;

/**
 * Get localized error message
 */
export function getLocalizedErrorMessage(
  key: string, 
  language: string = 'en',
  params?: Record<string, any>
): string {
  // For now, return English messages
  // TODO: Implement proper localization
  const keys = key.split('.');
  let message: any = ErrorMessages;
  
  for (const k of keys) {
    message = message[k];
    if (!message) {
      return 'An error occurred';
    }
  }

  // Simple parameter substitution
  if (params && typeof message === 'string') {
    return Object.entries(params).reduce(
      (msg, [param, value]) => msg.replace(`{${param}}`, String(value)),
      message
    );
  }

  return message;
}