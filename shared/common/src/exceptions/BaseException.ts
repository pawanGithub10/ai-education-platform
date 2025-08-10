/**
 * Base exception class for all custom exceptions
 */
export abstract class BaseException extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly metadata?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    metadata?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.metadata = metadata;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert exception to JSON for logging/serialization
   */
  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      metadata: this.metadata,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack
    };
  }

  /**
   * Get user-friendly error message
   */
  public getUserMessage(): string {
    return this.message;
  }
}

/**
 * Validation exception
 */
export class ValidationException extends BaseException {
  public readonly validationErrors: ValidationError[];

  constructor(
    message: string,
    validationErrors: ValidationError[] = [],
    metadata?: Record<string, any>
  ) {
    super(message, 'VALIDATION_ERROR', 400, metadata);
    this.validationErrors = validationErrors;
  }

  public getUserMessage(): string {
    if (this.validationErrors.length > 0) {
      return this.validationErrors.map(error => error.message).join(', ');
    }
    return this.message;
  }
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Authentication exception
 */
export class AuthenticationException extends BaseException {
  constructor(
    message: string = 'Authentication failed',
    metadata?: Record<string, any>
  ) {
    super(message, 'AUTHENTICATION_ERROR', 401, metadata);
  }
}

/**
 * Authorization exception
 */
export class AuthorizationException extends BaseException {
  constructor(
    message: string = 'Access denied',
    metadata?: Record<string, any>
  ) {
    super(message, 'AUTHORIZATION_ERROR', 403, metadata);
  }
}

/**
 * Not found exception
 */
export class NotFoundException extends BaseException {
  constructor(
    resource: string,
    identifier?: string,
    metadata?: Record<string, any>
  ) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    
    super(message, 'NOT_FOUND', 404, metadata);
  }
}

/**
 * Conflict exception (duplicate resources, etc.)
 */
export class ConflictException extends BaseException {
  constructor(
    message: string,
    metadata?: Record<string, any>
  ) {
    super(message, 'CONFLICT', 409, metadata);
  }
}

/**
 * Business logic exception
 */
export class BusinessLogicException extends BaseException {
  constructor(
    message: string,
    code: string = 'BUSINESS_LOGIC_ERROR',
    metadata?: Record<string, any>
  ) {
    super(message, code, 422, metadata);
  }
}

/**
 * External service exception
 */
export class ExternalServiceException extends BaseException {
  public readonly serviceName: string;

  constructor(
    serviceName: string,
    message: string,
    originalError?: Error,
    metadata?: Record<string, any>
  ) {
    super(
      `External service '${serviceName}' error: ${message}`,
      'EXTERNAL_SERVICE_ERROR',
      503,
      { ...metadata, serviceName, originalError: originalError?.message }
    );
    this.serviceName = serviceName;
  }
}

/**
 * Rate limiting exception
 */
export class RateLimitException extends BaseException {
  public readonly retryAfter?: number;

  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    metadata?: Record<string, any>
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, { ...metadata, retryAfter });
    this.retryAfter = retryAfter;
  }
}

/**
 * Configuration exception
 */
export class ConfigurationException extends BaseException {
  constructor(
    message: string,
    configKey?: string,
    metadata?: Record<string, any>
  ) {
    super(
      message,
      'CONFIGURATION_ERROR',
      500,
      { ...metadata, configKey }
    );
  }
}

/**
 * Database exception
 */
export class DatabaseException extends BaseException {
  constructor(
    message: string,
    operation?: string,
    metadata?: Record<string, any>
  ) {
    super(
      message,
      'DATABASE_ERROR',
      500,
      { ...metadata, operation }
    );
  }
}

/**
 * AI service specific exception
 */
export class AIServiceException extends BaseException {
  public readonly provider?: string;

  constructor(
    message: string,
    provider?: string,
    metadata?: Record<string, any>
  ) {
    super(
      message,
      'AI_SERVICE_ERROR',
      503,
      { ...metadata, provider }
    );
    this.provider = provider;
  }
}