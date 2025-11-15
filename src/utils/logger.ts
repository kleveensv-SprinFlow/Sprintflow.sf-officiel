type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface TimerInfo {
  label: string;
  startTime: number;
  id: string;
}

class PerformanceLogger {
  private timers: Map<string, TimerInfo> = new Map();
  private timerCounter: Map<string, number> = new Map();
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = this.shouldEnableLogs();
  }

  private shouldEnableLogs(): boolean {
    if (typeof window === 'undefined') return false;

    const envVar = import.meta.env.VITE_ENABLE_PERFORMANCE_LOGS;
    if (envVar !== undefined) {
      return envVar === 'true' || envVar === true;
    }

    try {
      const localStorageValue = localStorage.getItem('enablePerformanceLogs');
      if (localStorageValue !== null) {
        return localStorageValue === 'true';
      }
    } catch (e) {
      // localStorage might not be available
    }

    return import.meta.env.MODE === 'development';
  }

  private generateTimerId(label: string): string {
    const count = this.timerCounter.get(label) || 0;
    this.timerCounter.set(label, count + 1);
    return `${label}__${count}__${Date.now()}`;
  }

  time(label: string): string {
    if (!this.isEnabled) return '';

    const id = this.generateTimerId(label);
    const startTime = performance.now();

    this.timers.set(id, { label, startTime, id });

    console.log(`⏱️ [START] ${label}`);
    return id;
  }

  timeEnd(timerId: string): void {
    if (!this.isEnabled || !timerId) return;

    const timerInfo = this.timers.get(timerId);
    if (!timerInfo) {
      console.warn(`⚠️ Timer "${timerId}" not found. It may have already been stopped.`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - timerInfo.startTime;

    console.log(`⏱️ [END] ${timerInfo.label}: ${duration.toFixed(2)}ms`);

    this.timers.delete(timerId);
  }

  cleanupOrphanedTimers(maxAge: number = 30000): void {
    if (!this.isEnabled) return;

    const now = Date.now();
    const orphaned: string[] = [];

    this.timers.forEach((timer, id) => {
      const age = now - timer.startTime;
      if (age > maxAge) {
        orphaned.push(id);
      }
    });

    orphaned.forEach(id => {
      const timer = this.timers.get(id);
      if (timer) {
        console.warn(`⚠️ Cleaning up orphaned timer: ${timer.label} (${(now - timer.startTime).toFixed(0)}ms old)`);
        this.timers.delete(id);
      }
    });
  }

  log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.isEnabled && level !== 'error' && level !== 'warn') return;

    const emoji = {
      debug: '🐛',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    };

    const consoleMethod = level === 'debug' || level === 'info' ? console.log :
                          level === 'warn' ? console.warn : console.error;

    consoleMethod(`${emoji[level]} ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }

  isLoggingEnabled(): boolean {
    return this.isEnabled;
  }

  enableLogging(): void {
    this.isEnabled = true;
    try {
      localStorage.setItem('enablePerformanceLogs', 'true');
    } catch (e) {
      // localStorage might not be available
    }
  }

  disableLogging(): void {
    this.isEnabled = false;
    try {
      localStorage.setItem('enablePerformanceLogs', 'false');
    } catch (e) {
      // localStorage might not be available
    }
  }
}

export const logger = new PerformanceLogger();

if (typeof window !== 'undefined') {
  setInterval(() => {
    logger.cleanupOrphanedTimers();
  }, 60000);
}
