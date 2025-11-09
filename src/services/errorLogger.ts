import { supabase } from '../lib/supabase';
import { AppError, ErrorSeverity, shouldLogError } from '../utils/errors';

interface ErrorLog {
  timestamp: string;
  error_type: string;
  error_code?: string;
  message: string;
  stack?: string;
  user_id?: string;
  url: string;
  user_agent: string;
  severity: ErrorSeverity;
  additional_data?: any;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private queue: ErrorLog[] = [];
  private isProcessing = false;
  private maxQueueSize = 50;
  private flushInterval = 30000;

  private constructor() {
    this.startAutoFlush();
    this.setupUnloadHandler();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  async log(error: any, additionalData?: any) {
    if (!shouldLogError(error)) {
      return;
    }

    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      error_type: error.type || error.name || 'UnknownError',
      error_code: error.code,
      message: error.message || String(error),
      stack: error.stack,
      user_id: await this.getUserId(),
      url: window.location.href,
      user_agent: navigator.userAgent,
      severity: error.severity || ErrorSeverity.MEDIUM,
      additional_data: additionalData,
    };

    this.queue.push(errorLog);

    console.error('Error logged:', errorLog);

    if (this.queue.length >= this.maxQueueSize) {
      await this.flush();
    }
  }

  async logBatch(errors: any[]) {
    for (const error of errors) {
      await this.log(error);
    }
  }

  private async getUserId(): Promise<string | undefined> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id;
    } catch {
      return undefined;
    }
  }

  private async flush() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const logsToSend = [...this.queue];
    this.queue = [];

    try {
      console.log(`Flushing ${logsToSend.length} error logs`);

      await this.sendToConsole(logsToSend);
    } catch (error) {
      console.error('Failed to flush error logs:', error);
      this.queue.unshift(...logsToSend);
    } finally {
      this.isProcessing = false;
    }
  }

  private async sendToConsole(logs: ErrorLog[]) {
    logs.forEach((log) => {
      console.group(
        `%c[ERROR LOG] ${log.error_type} - ${log.severity}`,
        'color: #ff0000; font-weight: bold'
      );
      console.log('Message:', log.message);
      console.log('Code:', log.error_code);
      console.log('Time:', log.timestamp);
      console.log('URL:', log.url);
      console.log('User:', log.user_id);
      if (log.stack) console.log('Stack:', log.stack);
      if (log.additional_data) console.log('Data:', log.additional_data);
      console.groupEnd();
    });
  }

  private startAutoFlush() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  private setupUnloadHandler() {
    window.addEventListener('beforeunload', () => {
      if (this.queue.length > 0) {
        this.flush();
      }
    });
  }

  clearQueue() {
    this.queue = [];
  }
}

export const errorLogger = ErrorLogger.getInstance();
