import { Result } from '../types/Result';

/**
 * Base service interface for all business logic services
 */
export interface IBaseService {
  initialize(): Promise<void>;
  health(): Promise<ServiceHealth>;
  shutdown(): Promise<void>;
}

/**
 * Service health status
 */
export interface ServiceHealth {
  status: HealthStatus;
  timestamp: Date;
  dependencies: DependencyHealth[];
  metadata?: Record<string, any>;
}

export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY'
}

export interface DependencyHealth {
  name: string;
  status: HealthStatus;
  responseTime?: number;
  lastChecked: Date;
  error?: string;
}

/**
 * Generic CRUD service interface
 */
export interface ICrudService<T, CreateDTO, UpdateDTO> extends IBaseService {
  create(data: CreateDTO, userId?: string): Promise<Result<T>>;
  findById(id: string): Promise<Result<T>>;
  findAll(filters?: Record<string, any>): Promise<Result<T[]>>;
  update(id: string, data: UpdateDTO, userId?: string): Promise<Result<T>>;
  delete(id: string, userId?: string): Promise<Result<boolean>>;
}

/**
 * Paginated query interface
 */
export interface IPaginatedQuery {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
}

/**
 * Paginated result interface
 */
export interface IPaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}