export enum LogLevel {
  SILENT = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
}

export type LogLevelString = keyof typeof LogLevel;

export class Logger {
  private level: LogLevel;

  constructor(level: LogLevelString | LogLevel = LogLevel.WARN) {
    if (typeof level === "string") {
      this.level =
        LogLevel[level.toUpperCase() as LogLevelString] ?? LogLevel.WARN;
    } else {
      this.level = level;
    }
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }

  /**
   * Check if debug logging is enabled
   */
  isDebugEnabled(): boolean {
    return this.level >= LogLevel.DEBUG;
  }

  private log(level: LogLevel, ...args: any[]) {
    if (this.level >= level) {
      const prefix = `[${LogLevel[level]}]`;
      const time = new Date().toISOString();
      console.log(time, prefix, ...args);
    }
  }

  debug(...args: any[]) {
    this.log(LogLevel.DEBUG, ...args);
  }

  info(...args: any[]) {
    this.log(LogLevel.INFO, ...args);
  }

  warn(...args: any[]) {
    this.log(LogLevel.WARN, ...args);
  }

  error(...args: any[]) {
    this.log(LogLevel.ERROR, ...args);
  }
}
