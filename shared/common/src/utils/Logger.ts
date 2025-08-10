/**
 * Logging levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * Log entry interface
 */
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, any>;
  error?: Error;
}

/**
 * Logger interface
 */
export interface ILogger {
  debug(message: string, metadata?: Record<string, any>): void;
  info(message: string, metadata?: Record<string, any>): void;
  warn(message: string, metadata?: Record<string, any>): void;
  error(message: string, error?: Error, metadata?: Record<string, any>): void;
}

/**
 * Console-based logger implementation
 */
export class Logger implements ILogger {
  private readonly minLevel: LogLevel;

  constructor(
    private readonly context: string,
    minLevel: LogLevel = LogLevel.INFO
  ) {
    this.minLevel = minLevel;
  }

  public debug(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  public info(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  public warn(message: string, metadata?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  public error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, metadata, error);
  }

  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): void {
    if (level < this.minLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: this.context,
      metadata,
      error
    };

    // Format log message
    const timestamp = entry.timestamp.toISOString();
    const levelStr = LogLevel[level].padEnd(5);
    const contextStr = `[${this.context}]`;
    
    let logMessage = `${timestamp} ${levelStr} ${contextStr} ${message}`;
    
    if (metadata && Object.keys(metadata).length > 0) {
      logMessage += ` ${JSON.stringify(metadata)}`;
    }

    // Output to appropriate console method
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage);
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.ERROR:
        console.error(logMessage);
        if (error) {
          console.error(error.stack);
        }
        break;
    }
  }

  /**
   * Create a child logger with additional context
   */
  public child(additionalContext: string): Logger {
    return new Logger(`${this.context}:${additionalContext}`, this.minLevel);
  }

  /**
   * Set minimum log level
   */
  public setLevel(level: LogLevel): void {
    (this as any).minLevel = level;
  }
}

/**
 * Global logger instance
 */
export const globalLogger = new Logger('GLOBAL');