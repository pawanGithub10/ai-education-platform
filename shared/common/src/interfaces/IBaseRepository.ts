import { IPaginatedQuery, IPaginatedResult } from './IBaseService';
import { Result } from '../types/Result';

/**
 * Base repository interface for data access layer
 */
export interface IBaseRepository<T> {
  create(entity: Partial<T>): Promise<Result<T>>;
  findById(id: string): Promise<Result<T | null>>;
  findAll(query?: IPaginatedQuery): Promise<Result<IPaginatedResult<T>>>;
  update(id: string, updates: Partial<T>): Promise<Result<T>>;
  delete(id: string): Promise<Result<boolean>>;
  exists(id: string): Promise<Result<boolean>>;
  count(filters?: Record<string, any>): Promise<Result<number>>;
}

/**
 * Extended repository with search capabilities
 */
export interface ISearchableRepository<T> extends IBaseRepository<T> {
  search(query: SearchQuery): Promise<Result<IPaginatedResult<T>>>;
  findByField(field: keyof T, value: any): Promise<Result<T[]>>;
  findOneByField(field: keyof T, value: any): Promise<Result<T | null>>;
}

export interface SearchQuery extends IPaginatedQuery {
  searchTerm?: string;
  searchFields?: string[];
  exactMatch?: boolean;
}

/**
 * Repository with soft delete capabilities
 */
export interface ISoftDeletableRepository<T> extends IBaseRepository<T> {
  softDelete(id: string, deletedBy?: string): Promise<Result<boolean>>;
  restore(id: string, restoredBy?: string): Promise<Result<T>>;
  findDeleted(query?: IPaginatedQuery): Promise<Result<IPaginatedResult<T>>>;
  permanentDelete(id: string): Promise<Result<boolean>>;
}

/**
 * Transaction support
 */
export interface ITransactionalRepository<T> extends IBaseRepository<T> {
  transaction<R>(work: (repo: IBaseRepository<T>) => Promise<R>): Promise<Result<R>>;
}