import { v4 as uuidv4 } from 'uuid';
import { IBaseEntity, IAuditable, AuditEntry, AuditAction } from '../interfaces/IBaseEntity';

/**
 * Abstract base entity class with common properties and methods
 */
export abstract class BaseEntity implements IBaseEntity {
  public readonly id: string;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public createdBy?: string;
  public updatedBy?: string;

  constructor(data?: Partial<IBaseEntity>) {
    this.id = data?.id || uuidv4();
    this.createdAt = data?.createdAt || new Date();
    this.updatedAt = data?.updatedAt || new Date();
    this.createdBy = data?.createdBy;
    this.updatedBy = data?.updatedBy;
  }

  /**
   * Update the entity's timestamp and user
   */
  protected updateMetadata(updatedBy?: string): void {
    this.updatedAt = new Date();
    if (updatedBy) {
      this.updatedBy = updatedBy;
    }
  }

  /**
   * Check if the entity was created by a specific user
   */
  public isCreatedBy(userId: string): boolean {
    return this.createdBy === userId;
  }

  /**
   * Check if the entity was last updated by a specific user
   */
  public isUpdatedBy(userId: string): boolean {
    return this.updatedBy === userId;
  }

  /**
   * Get the entity's age in milliseconds
   */
  public getAge(): number {
    return Date.now() - this.createdAt.getTime();
  }

  /**
   * Convert entity to plain object for serialization
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      createdBy: this.createdBy,
      updatedBy: this.updatedBy
    };
  }
}

/**
 * Auditable entity with version control and change tracking
 */
export abstract class AuditableEntity extends BaseEntity implements IAuditable {
  public version: number;
  public auditLog: AuditEntry[];

  constructor(data?: Partial<IAuditable>) {
    super(data);
    this.version = data?.version || 1;
    this.auditLog = data?.auditLog || [];
  }

  /**
   * Add an audit entry for tracking changes
   */
  protected addAuditEntry(
    userId: string,
    action: AuditAction,
    changes: Record<string, any>,
    metadata?: Record<string, any>
  ): void {
    const entry: AuditEntry = {
      timestamp: new Date(),
      userId,
      action,
      changes,
      metadata
    };

    this.auditLog.push(entry);
    this.version += 1;
    this.updateMetadata(userId);
  }

  /**
   * Update entity with audit trail
   */
  protected auditUpdate(
    updates: Record<string, any>,
    userId: string,
    metadata?: Record<string, any>
  ): void {
    const changes: Record<string, any> = {};
    
    // Track changes
    for (const [key, newValue] of Object.entries(updates)) {
      if (this.hasOwnProperty(key)) {
        const oldValue = (this as any)[key];
        if (oldValue !== newValue) {
          changes[key] = { from: oldValue, to: newValue };
          (this as any)[key] = newValue;
        }
      }
    }

    if (Object.keys(changes).length > 0) {
      this.addAuditEntry(userId, AuditAction.UPDATE, changes, metadata);
    }
  }

  /**
   * Get audit history for a specific field
   */
  public getFieldHistory(fieldName: string): AuditEntry[] {
    return this.auditLog.filter(entry =>
      entry.changes && entry.changes[fieldName]
    );
  }

  /**
   * Get all changes made by a specific user
   */
  public getChangesByUser(userId: string): AuditEntry[] {
    return this.auditLog.filter(entry => entry.userId === userId);
  }

  /**
   * Check if entity was modified after a specific date
   */
  public wasModifiedAfter(date: Date): boolean {
    return this.auditLog.some(entry =>
      entry.timestamp > date && entry.action === AuditAction.UPDATE
    );
  }

  public toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      version: this.version,
      auditLog: this.auditLog
    };
  }
}