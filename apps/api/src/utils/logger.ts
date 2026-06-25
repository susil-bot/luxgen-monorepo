export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

function resolveLogLevel(): LogLevel {
  const raw = process.env.LOG_LEVEL as LogLevel | undefined;
  if (raw && Object.values(LogLevel).includes(raw)) return raw;
  return LogLevel.INFO;
}

function useJsonLogs(): boolean {
  return process.env.JSON_LOGS === 'true' || process.env.JSON_LOGS === '1';
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(resolveLogLevel());
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, meta?: unknown): string {
    if (useJsonLogs()) {
      return JSON.stringify({
        ts: new Date().toISOString(),
        level,
        message,
        ...(meta !== undefined ? { meta } : {}),
      });
    }
    const timestamp = new Date().toISOString();
    const metaStr = meta !== undefined ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  private emit(level: LogLevel, message: string, meta?: unknown): void {
    if (!this.shouldLog(level)) return;
    const line = this.formatMessage(level, message, meta);
    switch (level) {
      case LogLevel.ERROR:
        console.error(line);
        break;
      case LogLevel.WARN:
        console.warn(line);
        break;
      case LogLevel.DEBUG:
        console.debug(line);
        break;
      default:
        console.info(line);
    }
  }

  error(message: string, meta?: unknown): void {
    this.emit(LogLevel.ERROR, message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.emit(LogLevel.WARN, message, meta);
  }

  info(message: string, meta?: unknown): void {
    this.emit(LogLevel.INFO, message, meta);
  }

  debug(message: string, meta?: unknown): void {
    this.emit(LogLevel.DEBUG, message, meta);
  }
}

export const logger = new Logger();
