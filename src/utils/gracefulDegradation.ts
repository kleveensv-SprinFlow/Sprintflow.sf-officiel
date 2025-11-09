import { errorLogger } from '../services/errorLogger';
import { getUserFriendlyMessage } from './errors';

export interface FallbackOptions<T> {
  fallbackValue?: T;
  onError?: (error: any) => void;
  silent?: boolean;
  logError?: boolean;
}

export async function withFallback<T>(
  fn: () => Promise<T>,
  options: FallbackOptions<T> = {}
): Promise<T | undefined> {
  const { fallbackValue, onError, silent = false, logError = true } = options;

  try {
    return await fn();
  } catch (error) {
    if (logError) {
      errorLogger.log(error);
    }

    if (onError) {
      onError(error);
    }

    if (!silent) {
      console.warn('Operation failed, using fallback:', getUserFriendlyMessage(error));
    }

    return fallbackValue;
  }
}

export function safeExecute<T>(
  fn: () => T,
  options: FallbackOptions<T> = {}
): T | undefined {
  const { fallbackValue, onError, silent = false, logError = true } = options;

  try {
    return fn();
  } catch (error) {
    if (logError) {
      errorLogger.log(error);
    }

    if (onError) {
      onError(error);
    }

    if (!silent) {
      console.warn('Operation failed, using fallback:', getUserFriendlyMessage(error));
    }

    return fallbackValue;
  }
}

export class Cache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private ttl: number;

  constructor(ttlMs = 300000) {
    this.ttl = ttlMs;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  cache: Cache<T>,
  options: FallbackOptions<T> = {}
): Promise<T | undefined> {
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  try {
    const result = await fn();
    cache.set(key, result);
    return result;
  } catch (error) {
    return withFallback(fn, options);
  }
}

export interface StaleWhileRevalidateOptions<T> extends FallbackOptions<T> {
  cache: Cache<T>;
  key: string;
  onRevalidate?: (data: T) => void;
}

export async function staleWhileRevalidate<T>(
  fn: () => Promise<T>,
  options: StaleWhileRevalidateOptions<T>
): Promise<T | undefined> {
  const { cache, key, onRevalidate, ...fallbackOptions } = options;

  const stale = cache.get(key);

  const revalidate = async () => {
    try {
      const fresh = await fn();
      cache.set(key, fresh);
      if (onRevalidate) {
        onRevalidate(fresh);
      }
      return fresh;
    } catch (error) {
      errorLogger.log(error);
      return stale;
    }
  };

  if (stale !== undefined) {
    revalidate();
    return stale;
  }

  return withFallback(fn, fallbackOptions);
}

export class FeatureFlags {
  private flags = new Map<string, boolean>();

  enable(feature: string): void {
    this.flags.set(feature, true);
  }

  disable(feature: string): void {
    this.flags.set(feature, false);
  }

  isEnabled(feature: string, defaultValue = false): boolean {
    return this.flags.get(feature) ?? defaultValue;
  }

  toggle(feature: string): void {
    this.flags.set(feature, !this.isEnabled(feature));
  }
}

export const featureFlags = new FeatureFlags();

export function withFeatureFlag<T>(
  feature: string,
  fn: () => T,
  fallback?: () => T
): T | undefined {
  if (featureFlags.isEnabled(feature)) {
    return safeExecute(fn, {
      fallbackValue: fallback?.(),
      silent: true,
    });
  }

  return fallback?.();
}

export async function withFeatureFlagAsync<T>(
  feature: string,
  fn: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T | undefined> {
  if (featureFlags.isEnabled(feature)) {
    return withFallback(fn, {
      fallbackValue: fallback ? await fallback() : undefined,
      silent: true,
    });
  }

  return fallback?.();
}
