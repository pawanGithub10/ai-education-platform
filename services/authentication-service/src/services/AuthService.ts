import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
  BaseService, 
  Result, 
  Logger, 
  HealthStatus,
  AuthenticationException,
  ValidationException,
  NotFoundException,
  BusinessLogicException
} from '@ai-education/common';
import { User, TeacherUser, StudentUser, AdminUser } from '../models/User';
import { IUserRepository } from '../repositories/IUserRepository';

/**
 * Authentication request/response types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  schoolId?: string;
  additionalData?: Record<string, any>;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  schoolId?: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Authentication service with JWT and RBAC
 */
export class AuthService extends BaseService {
  private readonly saltRounds = 12;
  private readonly accessTokenExpiry = '15m';
  private readonly refreshTokenExpiry = '7d';
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;

  constructor(
    private readonly userRepository: IUserRepository,
    jwtSecret: string,
    jwtRefreshSecret: string,
    logger?: Logger
  ) {
    super('AuthService', logger);
    this.jwtSecret = jwtSecret;
    this.jwtRefreshSecret = jwtRefreshSecret;
  }

  protected async doInitialize(): Promise<void> {
    // Add database health check
    this.addDependency('UserRepository', async () => {
      const start = Date.now();
      try {
        await this.userRepository.count();
        return {
          name: 'UserRepository',
          status: HealthStatus.HEALTHY,
          responseTime: Date.now() - start,
          lastChecked: new Date()
        };
      } catch (error) {
        return {
          name: 'UserRepository',
          status: HealthStatus.UNHEALTHY,
          responseTime: Date.now() - start,
          lastChecked: new Date(),
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });

    this.logger.info('Auth service initialized successfully');
  }

  protected async doShutdown(): Promise<void> {
    this.logger.info('Auth service shutdown completed');
  }

  protected async checkServiceHealth(): Promise<HealthStatus> {
    // Check if JWT secrets are configured
    if (!this.jwtSecret || !this.jwtRefreshSecret) {
      return HealthStatus.UNHEALTHY;
    }
    return HealthStatus.HEALTHY;
  }

  protected async getHealthMetadata(): Promise<Record<string, any>> {
    return {
      jwtConfigured: !!this.jwtSecret,
      refreshTokenConfigured: !!this.jwtRefreshSecret
    };
  }

  /**
   * Authenticate user with email and password
   */
  public async login(request: LoginRequest): Promise<Result<LoginResponse>> {
    this.validateReady();

    try {
      // Find user by email
      const userResult = await this.userRepository.findByEmail(request.email);
      if (userResult.isFailure) {
        return Result.failure('Authentication failed');
      }

      const user = userResult.data;
      if (!user) {
        return Result.failure('Authentication failed');
      }

      // Check if user can login
      if (!user.canLogin()) {
        if (user.isLocked) {
          return Result.failure('Account is locked due to multiple failed attempts');
        }
        if (!user.isActive) {
          return Result.failure('Account is inactive');
        }
        if (!user.isVerified) {
          return Result.failure('Account is not verified');
        }
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(request.password, user.passwordHash);
      if (!isPasswordValid) {
        // Record failed attempt
        user.recordFailedLogin();
        await this.userRepository.update(user.id, user);
        return Result.failure('Authentication failed');
      }

      // Record successful login
      user.recordSuccessfulLogin();
      await this.userRepository.update(user.id, user);

      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      const response: LoginResponse = {
        user,
        accessToken,
        refreshToken,
        expiresIn: 15 * 60 // 15 minutes in seconds
      };

      this.logger.info(`User ${user.email} logged in successfully`);
      return Result.success(response);

    } catch (error) {
      this.logger.error('Login failed', error);
      return Result.failure('Authentication failed');
    }
  }

  /**
   * Register a new user
   */
  public async register(request: RegisterRequest): Promise<Result<User>> {
    this.validateReady();

    try {
      // Validate request
      const validation = this.validateRegistrationRequest(request);
      if (validation.isFailure) {
        return validation;
      }

      // Check if user already exists
      const existingUserResult = await this.userRepository.findByEmail(request.email);
      if (existingUserResult.isSuccess && existingUserResult.data) {
        return Result.failure('User with this email already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(request.password, this.saltRounds);

      // Create user based on role
      let user: User;
      switch (request.role.toUpperCase()) {
        case 'TEACHER':
          user = new TeacherUser({
            email: request.email,
            passwordHash,
            firstName: request.firstName,
            lastName: request.lastName,
            phone: request.phone,
            schoolId: request.schoolId,
            ...request.additionalData
          });
          break;

        case 'STUDENT':
          user = new StudentUser({
            email: request.email,
            passwordHash,
            firstName: request.firstName,
            lastName: request.lastName,
            phone: request.phone,
            schoolId: request.schoolId,
            ...request.additionalData
          });
          break;

        case 'ADMIN':
        case 'SCHOOL_ADMIN':
          user = new AdminUser({
            email: request.email,
            passwordHash,
            firstName: request.firstName,
            lastName: request.lastName,
            phone: request.phone,
            schoolId: request.schoolId,
            adminLevel: 'SCHOOL',
            ...request.additionalData
          });
          break;

        default:
          return Result.failure('Invalid user role');
      }

      // Save user
      const saveResult = await this.userRepository.create(user);
      if (saveResult.isFailure) {
        return Result.failure('Failed to create user account');
      }

      this.logger.info(`User ${request.email} registered successfully`);
      return Result.success(saveResult.data);

    } catch (error) {
      this.logger.error('Registration failed', error);
      return Result.failure('Failed to create user account');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  public async refreshToken(request: RefreshTokenRequest): Promise<Result<LoginResponse>> {
    this.validateReady();

    try {
      // Verify refresh token
      const payload = jwt.verify(request.refreshToken, this.jwtRefreshSecret) as TokenPayload;
      
      // Find user
      const userResult = await this.userRepository.findById(payload.userId);
      if (userResult.isFailure || !userResult.data) {
        return Result.failure('Invalid refresh token');
      }

      const user = userResult.data;
      if (!user.canLogin()) {
        return Result.failure('User account is not active');
      }

      // Generate new tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      const response: LoginResponse = {
        user,
        accessToken,
        refreshToken,
        expiresIn: 15 * 60
      };

      return Result.success(response);

    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return Result.failure('Invalid refresh token');
      }
      this.logger.error('Token refresh failed', error);
      return Result.failure('Failed to refresh token');
    }
  }

  /**
   * Verify access token and return user
   */
  public async verifyToken(token: string): Promise<Result<User>> {
    this.validateReady();

    try {
      const payload = jwt.verify(token, this.jwtSecret) as TokenPayload;
      
      const userResult = await this.userRepository.findById(payload.userId);
      if (userResult.isFailure || !userResult.data) {
        return Result.failure('Invalid token');
      }

      const user = userResult.data;
      if (!user.isActive) {
        return Result.failure('User account is not active');
      }

      return Result.success(user);

    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return Result.failure('Invalid token');
      }
      return Result.failure('Token verification failed');
    }
  }

  /**
   * Change user password
   */
  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<Result<boolean>> {
    this.validateReady();

    try {
      const userResult = await this.userRepository.findById(userId);
      if (userResult.isFailure || !userResult.data) {
        return Result.failure('User not found');
      }

      const user = userResult.data;

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return Result.failure('Current password is incorrect');
      }

      // Validate new password
      const passwordValidation = this.validatePassword(newPassword);
      if (passwordValidation.isFailure) {
        return passwordValidation;
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, this.saltRounds);
      
      // Update password
      user.resetPassword(newPasswordHash, userId);
      await this.userRepository.update(userId, user);

      this.logger.info(`Password changed for user ${user.email}`);
      return Result.success(true);

    } catch (error) {
      this.logger.error('Password change failed', error);
      return Result.failure('Failed to change password');
    }
  }

  /**
   * Generate JWT access token
   */
  private generateAccessToken(user: User): string {
    const payload: Partial<TokenPayload> = {
      userId: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.accessTokenExpiry });
  }

  /**
   * Generate JWT refresh token
   */
  private generateRefreshToken(user: User): string {
    const payload: Partial<TokenPayload> = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, this.jwtRefreshSecret, { expiresIn: this.refreshTokenExpiry });
  }

  /**
   * Validate registration request
   */
  private validateRegistrationRequest(request: RegisterRequest): Result<boolean> {
    const errors: string[] = [];

    if (!request.email || !this.isValidEmail(request.email)) {
      errors.push('Valid email is required');
    }

    if (!request.password) {
      errors.push('Password is required');
    } else {
      const passwordValidation = this.validatePassword(request.password);
      if (passwordValidation.isFailure) {
        errors.push(passwordValidation.error);
      }
    }

    if (!request.firstName || request.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters');
    }

    if (!request.lastName || request.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters');
    }

    if (!request.role || !['TEACHER', 'STUDENT', 'ADMIN', 'SCHOOL_ADMIN'].includes(request.role.toUpperCase())) {
      errors.push('Valid role is required');
    }

    if (errors.length > 0) {
      return Result.failure(errors.join(', '));
    }

    return Result.success(true);
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): Result<boolean> {
    if (password.length < 8) {
      return Result.failure('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      return Result.failure('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      return Result.failure('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      return Result.failure('Password must contain at least one number');
    }

    return Result.success(true);
  }
}