import { 
  IBaseService, 
  ServiceHealth, 
  HealthStatus, 
  DependencyHealth 
} from '../interfaces/IBaseService';
import { Logger } from '../utils/Logger';

/**
 * Abstract base service class with common service functionality
 */
export abstract class BaseService implements IBaseService {
  protected logger: Logger;
  protected dependencies: Map<string, () => Promise<DependencyHealth>>;
  protected isInitialized: boolean = false;
  protected isShuttingDown: boolean = false;

  constructor(
    protected readonly serviceName: string,
    logger?: Logger
  ) {
    this.logger = logger || new Logger(serviceName);
    this.dependencies = new Map();
  }

  /**
   * Initialize the service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Service already initialized');
      return;
    }

    try {
      this.logger.info('Initializing service...');
      await this.doInitialize();
      this.isInitialized = true;
      this.logger.info('Service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize service', error);
      throw error;
    }
  }

  /**
   * Get service health status
   */
  public async health(): Promise<ServiceHealth> {
    const dependencies: DependencyHealth[] = [];
    let overallStatus = HealthStatus.HEALTHY;

    // Check all dependencies
    for (const [name, healthCheck] of this.dependencies) {
      try {
        const depHealth = await healthCheck();
        dependencies.push(depHealth);

        if (depHealth.status === HealthStatus.UNHEALTHY) {
          overallStatus = HealthStatus.UNHEALTHY;
        } else if (depHealth.status === HealthStatus.DEGRADED && overallStatus === HealthStatus.HEALTHY) {
          overallStatus = HealthStatus.DEGRADED;
        }
      } catch (error) {
        dependencies.push({
          name,
          status: HealthStatus.UNHEALTHY,
          lastChecked: new Date(),
          error: error instanceof Error ? error.message : String(error)
        });
        overallStatus = HealthStatus.UNHEALTHY;
      }
    }

    // Check service-specific health
    try {
      const serviceSpecificStatus = await this.checkServiceHealth();
      if (serviceSpecificStatus === HealthStatus.UNHEALTHY) {
        overallStatus = HealthStatus.UNHEALTHY;
      } else if (serviceSpecificStatus === HealthStatus.DEGRADED && overallStatus === HealthStatus.HEALTHY) {
        overallStatus = HealthStatus.DEGRADED;
      }
    } catch (error) {
      overallStatus = HealthStatus.UNHEALTHY;
    }

    return {
      status: overallStatus,
      timestamp: new Date(),
      dependencies,
      metadata: await this.getHealthMetadata()
    };
  }

  /**
   * Shutdown the service gracefully
   */
  public async shutdown(): Promise<void> {
    if (this.isShuttingDown) {
      this.logger.warn('Service already shutting down');
      return;
    }

    try {
      this.logger.info('Shutting down service...');
      this.isShuttingDown = true;
      await this.doShutdown();
      this.isInitialized = false;
      this.logger.info('Service shutdown completed');
    } catch (error) {
      this.logger.error('Error during service shutdown', error);
      throw error;
    }
  }

  /**
   * Add a dependency health check
   */
  protected addDependency(
    name: string, 
    healthCheck: () => Promise<DependencyHealth>
  ): void {
    this.dependencies.set(name, healthCheck);
  }

  /**
   * Remove a dependency health check
   */
  protected removeDependency(name: string): void {
    this.dependencies.delete(name);
  }

  /**
   * Check if service is ready to handle requests
   */
  protected isReady(): boolean {
    return this.isInitialized && !this.isShuttingDown;
  }

  /**
   * Validate service is ready, throw error if not
   */
  protected validateReady(): void {
    if (!this.isReady()) {
      throw new Error(`Service ${this.serviceName} is not ready`);
    }
  }

  // Abstract methods to be implemented by concrete services

  /**
   * Service-specific initialization logic
   */
  protected abstract doInitialize(): Promise<void>;

  /**
   * Service-specific shutdown logic
   */
  protected abstract doShutdown(): Promise<void>;

  /**
   * Service-specific health check logic
   */
  protected abstract checkServiceHealth(): Promise<HealthStatus>;

  /**
   * Get service-specific health metadata
   */
  protected abstract getHealthMetadata(): Promise<Record<string, any>>;
}