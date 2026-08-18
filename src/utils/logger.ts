export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  none: 100,
};

export interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
  enabled?: boolean;
}

export class Logger {
  private level: LogLevel;
  private prefix: string;
  private enabled: boolean;
  private logs: Array<{ level: LogLevel; message: string; timestamp: number; meta?: any }> = [];

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? 'info';
    this.prefix = options.prefix ?? '';
    this.enabled = options.enabled ?? true;
  }

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.level];
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const tag = this.prefix ? `[${this.prefix}]` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${tag} ${message}`;
  }

  public debug(message: string, meta?: any): void {
    this.record('debug', message, meta);
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), meta !== undefined ? meta : '');
    }
  }

  public info(message: string, meta?: any): void {
    this.record('info', message, meta);
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), meta !== undefined ? meta : '');
    }
  }

  public warn(message: string, meta?: any): void {
    this.record('warn', message, meta);
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), meta !== undefined ? meta : '');
    }
  }

  public error(message: string, meta?: any): void {
    this.record('error', message, meta);
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), meta !== undefined ? meta : '');
    }
  }

  private record(level: LogLevel, message: string, meta?: any): void {
    this.logs.push({
      level,
      message,
      timestamp: Date.now(),
      meta,
    });
  }

  public getLogs(): Array<{ level: LogLevel; message: string; timestamp: number; meta?: any }> {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public child(subPrefix: string): Logger {
    const combinedPrefix = this.prefix ? `${this.prefix}:${subPrefix}` : subPrefix;
    return new Logger({
      level: this.level,
      prefix: combinedPrefix,
      enabled: this.enabled,
    });
  }
}

export const defaultLogger = new Logger({ level: 'info', prefix: 'AgentSystem' });
