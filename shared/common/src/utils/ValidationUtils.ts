import Joi from 'joi';
import { Result } from '../types/Result';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Common validation utilities
 */
export class ValidationUtils {
  /**
   * Validate email format
   */
  public static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate Indian phone number
   */
  public static isValidIndianPhone(phone: string): boolean {
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  }

  /**
   * Validate password strength
   */
  public static validatePassword(password: string): ValidationResult {
    const errors: ValidationError[] = [];

    if (password.length < 8) {
      errors.push({
        field: 'password',
        message: 'Password must be at least 8 characters long'
      });
    }

    if (!/[A-Z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one uppercase letter'
      });
    }

    if (!/[a-z]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one lowercase letter'
      });
    }

    if (!/\d/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one number'
      });
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push({
        field: 'password',
        message: 'Password must contain at least one special character'
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate using Joi schema
   */
  public static validateWithSchema<T>(
    data: any,
    schema: Joi.ObjectSchema<T>
  ): Result<T> {
    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
      const errors: ValidationError[] = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return Result.failure(
        'Validation failed',
        { validationErrors: errors }
      );
    }

    return Result.success(value as T);
  }

  /**
   * Sanitize string input
   */
  public static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, '');
  }

  /**
   * Check if string contains only alphanumeric characters
   */
  public static isAlphanumeric(str: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(str);
  }

  /**
   * Validate UUID format
   */
  public static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate Indian curriculum standards
   */
  public static isValidCurriculumStandard(standard: string): boolean {
    const validStandards = [
      'CBSE', 'ICSE', 'NCERT', 'MAHARASHTRA_BOARD', 'GUJARAT_BOARD',
      'KARNATAKA_BOARD', 'TAMIL_NADU_BOARD', 'WEST_BENGAL_BOARD',
      'RAJASTHAN_BOARD', 'UP_BOARD', 'IB', 'CAMBRIDGE'
    ];
    return validStandards.includes(standard.toUpperCase());
  }

  /**
   * Validate grade level
   */
  public static isValidGrade(grade: string): boolean {
    const validGrades = [
      'NURSERY', 'LKG', 'UKG',
      'CLASS_1', 'CLASS_2', 'CLASS_3', 'CLASS_4', 'CLASS_5',
      'CLASS_6', 'CLASS_7', 'CLASS_8', 'CLASS_9', 'CLASS_10',
      'CLASS_11', 'CLASS_12'
    ];
    return validGrades.includes(grade.toUpperCase());
  }

  /**
   * Validate subject
   */
  public static isValidSubject(subject: string): boolean {
    const validSubjects = [
      'MATHEMATICS', 'SCIENCE', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY',
      'ENGLISH', 'HINDI', 'SOCIAL_STUDIES', 'HISTORY', 'GEOGRAPHY',
      'CIVICS', 'ECONOMICS', 'COMPUTER_SCIENCE', 'ART',
      'PHYSICAL_EDUCATION', 'MUSIC', 'ENVIRONMENTAL_STUDIES'
    ];
    return validSubjects.includes(subject.toUpperCase());
  }
}

/**
 * Common Joi schemas for reuse
 */
export const CommonSchemas = {
  email: Joi.string().email().required(),
  
  password: Joi.string().min(8).required(),
  
  uuid: Joi.string().uuid().required(),
  
  indianPhone: Joi.string().pattern(/^(\+91|91)?[6-9]\d{9}$/).required(),
  
  name: Joi.string().trim().min(2).max(100).required(),
  
  curriculum: Joi.string().valid(
    'CBSE', 'ICSE', 'NCERT', 'MAHARASHTRA_BOARD', 'GUJARAT_BOARD',
    'KARNATAKA_BOARD', 'TAMIL_NADU_BOARD', 'WEST_BENGAL_BOARD',
    'RAJASTHAN_BOARD', 'UP_BOARD', 'IB', 'CAMBRIDGE'
  ).required(),
  
  grade: Joi.string().valid(
    'NURSERY', 'LKG', 'UKG',
    'CLASS_1', 'CLASS_2', 'CLASS_3', 'CLASS_4', 'CLASS_5',
    'CLASS_6', 'CLASS_7', 'CLASS_8', 'CLASS_9', 'CLASS_10',
    'CLASS_11', 'CLASS_12'
  ).required(),
  
  subject: Joi.string().valid(
    'MATHEMATICS', 'SCIENCE', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY',
    'ENGLISH', 'HINDI', 'SOCIAL_STUDIES', 'HISTORY', 'GEOGRAPHY',
    'CIVICS', 'ECONOMICS', 'COMPUTER_SCIENCE', 'ART',
    'PHYSICAL_EDUCATION', 'MUSIC', 'ENVIRONMENTAL_STUDIES'
  ).required()
};