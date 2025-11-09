import { supabase } from './supabase';
import { parseSupabaseError, NetworkError } from '../utils/errors';
import { withRetry, withTimeout } from '../utils/networkHandlers';
import { errorLogger } from '../services/errorLogger';
import { errorNotification } from '../services/errorNotification';

export interface QueryOptions {
  retry?: boolean;
  maxRetries?: number;
  timeout?: number;
  showError?: boolean;
  silent?: boolean;
}

const DEFAULT_TIMEOUT = 10000;

export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: QueryOptions = {}
): Promise<{ data: T | null; error: any }> {
  const {
    retry = true,
    maxRetries = 3,
    timeout = DEFAULT_TIMEOUT,
    showError = true,
    silent = false,
  } = options;

  try {
    const executeFn = async () => {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new NetworkError(
              'Query timeout',
              'La requête a pris trop de temps. Veuillez réessayer.'
            )
          );
        }, timeout);
      });

      return Promise.race([queryFn(), timeoutPromise]) as Promise<{
        data: T | null;
        error: any;
      }>;
    };

    let result;

    if (retry) {
      result = await withRetry(executeFn, {
        maxRetries,
        onRetry: (attempt, error) => {
          if (!silent) {
            console.log(`Retry attempt ${attempt}/${maxRetries}`, error);
          }
        },
      });
    } else {
      result = await executeFn();
    }

    if (result.error) {
      const appError = parseSupabaseError(result.error);

      errorLogger.log(appError, {
        query: queryFn.toString(),
        timestamp: new Date().toISOString(),
      });

      if (showError) {
        errorNotification.showError(appError);
      }

      return { data: null, error: appError };
    }

    return result;
  } catch (error) {
    const appError = parseSupabaseError(error);

    errorLogger.log(appError, {
      query: queryFn.toString(),
      timestamp: new Date().toISOString(),
    });

    if (showError) {
      errorNotification.showError(appError);
    }

    return { data: null, error: appError };
  }
}

export async function safeSelect<T>(
  table: string,
  columns = '*',
  filters?: Record<string, any>,
  options?: QueryOptions
): Promise<{ data: T[] | null; error: any }> {
  return safeQuery<T[]>(async () => {
    let query = supabase.from(table).select(columns);

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        query = query.eq(key, value);
      }
    }

    return query;
  }, options);
}

export async function safeInsert<T>(
  table: string,
  data: Partial<T>,
  options?: QueryOptions
): Promise<{ data: T | null; error: any }> {
  return safeQuery<T>(
    async () => {
      return supabase.from(table).insert(data).select().maybeSingle();
    },
    { ...options, retry: false }
  );
}

export async function safeUpdate<T>(
  table: string,
  id: string,
  updates: Partial<T>,
  options?: QueryOptions
): Promise<{ data: T | null; error: any }> {
  return safeQuery<T>(
    async () => {
      return supabase.from(table).update(updates).eq('id', id).select().maybeSingle();
    },
    { ...options, retry: false }
  );
}

export async function safeDelete(
  table: string,
  id: string,
  options?: QueryOptions
): Promise<{ error: any }> {
  const result = await safeQuery(
    async () => {
      return supabase.from(table).delete().eq('id', id);
    },
    { ...options, retry: false }
  );

  return { error: result.error };
}

export async function safeRpc<T>(
  functionName: string,
  params?: Record<string, any>,
  options?: QueryOptions
): Promise<{ data: T | null; error: any }> {
  return safeQuery<T>(async () => {
    return supabase.rpc(functionName, params);
  }, options);
}

export { supabase };
