export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

function resolveLogLevel(): LogLevel {
  const raw = process.env.LOG_LEVEL?.toLowerCase();
  if (raw && Object.values(LogLevel).includes(raw as LogLevel)) {
    return raw as LogLevel;
  }
  return LogLevel.INFO;
}

function useJsonLogs(): boolean {
  return process.env.JSON_LOGS === 'true';
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(resolveLogLevel());
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private write(level: LogLevel, message: string, meta?: unknown): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    if (useJsonLogs()) {
      const payload = { timestamp, level, message, ...(meta && typeof meta === 'object' ? meta : { meta }) };
      const line = JSON.stringify(payload);
      if (level === LogLevel.ERROR) console.error(line);
      else if (level === LogLevel.WARN) console.warn(line);
      else if (level === LogLevel.DEBUG) console.debug(line);
      else console.info(line);
      return;
    }

    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    const line = `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
    if (level === LogLevel.ERROR) console.error(line);
    else if (level === LogLevel.WARN) console.warn(line);
    else if (level === LogLevel.DEBUG) console.debug(line);
    else console.info(line);
  }

  error(message: string, meta?: unknown): void {
    this.write(LogLevel.ERROR, message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.write(LogLevel.WARN, message, meta);
  }

  info(message: string, meta?: unknown): void {
    this.write(LogLevel.INFO, message, meta);
  }

  debug(message: string, meta?: unknown): void {
    this.write(LogLevel.DEBUG, message, meta);
  }
}

export const logger = new Logger();
