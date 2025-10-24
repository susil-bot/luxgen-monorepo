/**
 * Shared logging utilities
 */

export interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

export const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

export interface LogEntry {
  level: keyof LogLevel;
  message: string;
  timestamp: Date;
  tenantId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export class Logger {
  private static instance: Logger;
  private logLevel: keyof LogLevel = 'INFO';
  
  private constructor() {}
  
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  public setLogLevel(level: keyof LogLevel): void {
    this.logLevel = level;
  }
  
  public log(entry: LogEntry): void {
    if (this.shouldLog(entry.level)) {
      console.log(JSON.stringify({
        ...entry,
        timestamp: entry.timestamp.toISOString()
      }));
    }
  }
  
  public error(message: string, metadata?: Record<string, any>): void {
    this.log({
      level: 'ERROR',
      message,
      timestamp: new Date(),
      metadata
    });
  }
  
  public warn(message: string, metadata?: Record<string, any>): void {
    this.log({
      level: 'WARN',
      message,
      timestamp: new Date(),
      metadata
    });
  }
  
  public info(message: string, metadata?: Record<string, any>): void {
    this.log({
      level: 'INFO',
      message,
      timestamp: new Date(),
      metadata
    });
  }
  
  public debug(message: string, metadata?: Record<string, any>): void {
    this.log({
      level: 'DEBUG',
      message,
      timestamp: new Date(),
      metadata
    });
  }
  
  private shouldLog(level: keyof LogLevel): boolean {
    const levels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex <= currentLevelIndex;
  }
}

export const logger = Logger.getInstance();
