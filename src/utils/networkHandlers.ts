import { NetworkError, isRetryableError } from './errors';

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: any) => void;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry,
  } = options;

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }

      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      await sleep(Math.min(delay, maxDelay));
      delay *= backoffFactor;
    }
  }

  throw lastError;
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError?: Error
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        timeoutError || new NetworkError('Request timeout', 'La requête a pris trop de temps')
      );
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  retryOptions?: RetryOptions
): Promise<T> {
  return withRetry(() => withTimeout(fn(), timeoutMs), retryOptions);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private concurrent = 1;

  constructor(concurrent = 1) {
    this.concurrent = concurrent;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process() {
    if (this.processing) return;

    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.concurrent);
      await Promise.all(batch.map((fn) => fn()));
    }

    this.processing = false;
  }

  clear() {
    this.queue = [];
  }

  get length() {
    return this.queue.length;
  }
}

export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> {
  return withRetry(async () => {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new NetworkError(
        `HTTP ${response.status}: ${response.statusText}`,
        'Erreur lors de la récupération des données',
        { status: response.status, statusText: response.statusText }
      );
    }

    return response;
  }, retryOptions);
}

export class NetworkMonitor {
  private listeners: Array<(isOnline: boolean) => void> = [];
  private isOnline = navigator.onLine;

  constructor() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notify();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notify();
  };

  private notify() {
    this.listeners.forEach((listener) => listener(this.isOnline));
  }

  subscribe(listener: (isOnline: boolean) => void): () => void {
    this.listeners.push(listener);
    listener(this.isOnline);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getStatus() {
    return this.isOnline;
  }

  destroy() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.listeners = [];
  }
}

export const networkMonitor = new NetworkMonitor();
