/**
 * Base entity interface for all domain entities
 */
export interface IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Soft delete capability
 */
export interface ISoftDeletable {
  deletedAt?: Date;
  deletedBy?: string;
  isDeleted: boolean;
}

/**
 * Auditable entity interface
 */
export interface IAuditable extends IBaseEntity {
  version: number;
  auditLog: AuditEntry[];
}

/**
 * Audit entry for tracking changes
 */
export interface AuditEntry {
  timestamp: Date;
  userId: string;
  action: AuditAction;
  changes: Record<string, any>;
  metadata?: Record<string, any>;
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT'
}