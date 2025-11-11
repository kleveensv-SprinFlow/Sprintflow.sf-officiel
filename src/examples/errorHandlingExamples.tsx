import { useState, useEffect } from 'react';
import {
  NetworkError,
  ApiError,
  ValidationError,
  parseSupabaseError
} from '../utils/errors';
import {
  withRetry,
  withTimeout,
  fetchWithRetry,
  networkMonitor
} from '../utils/networkHandlers';
import {
  withFallback,
  staleWhileRevalidate,
  Cache
} from '../utils/gracefulDegradation';
import { errorLogger } from '../services/errorLogger';
import { errorNotification } from '../services/errorNotification';
import {
  safeQuery,
  safeSelect,
  safeInsert,
  safeUpdate,
  safeRpc
} from '../lib/supabaseWithErrorHandling';
import { supabase } from '../lib/supabase';

const workoutsCache = new Cache<any[]>(300000);

export function NetworkErrorExample() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const unsubscribe = networkMonitor.subscribe((online) => {
      setIsOnline(online);

      if (online) {
        errorNotification.showSuccess('Connexion rétablie');
        loadDataWithRetry();
      } else {
        errorNotification.showWarning('Connexion perdue. Mode hors ligne activé.');
      }
    });

    return unsubscribe;
  }, []);

  const loadDataWithRetry = async () => {
    setLoading(true);

    try {
      const result = await withRetry(
        async () => {
          const response = await fetch('/api/workouts');
          if (!response.ok) {
            throw new NetworkError(
              `HTTP ${response.status}`,
              'Impossible de charger les données'
            );
          }
          return response.json();
        },
        {
          maxRetries: 3,
          initialDelay: 1000,
          backoffFactor: 2,
          onRetry: (attempt) => {
            errorNotification.showInfo(`Tentative ${attempt}/3...`);
          }
        }
      );

      setData(result);
      errorNotification.showSuccess('Données chargées');
    } catch (error) {
      errorLogger.log(error);
      errorNotification.showError(error);
    } finally {
      setLoading(false);
    }
  };

  const loadWithTimeout = async () => {
    setLoading(true);

    try {
      const result = await withTimeout(
        fetch('/api/slow-endpoint').then(r => r.json()),
        5000
      );

      setData(result);
    } catch (error) {
      if (error instanceof NetworkError && error.message.includes('timeout')) {
        errorNotification.showError(
          error,
          {
            duration: 8000,
            action: {
              label: 'Réessayer',
              onClick: loadWithTimeout
            }
          }
        );
      } else {
        errorNotification.showError(error);
      }
      errorLogger.log(error);
    } finally {
      setLoading(false);
    }
  };

  const loadWithFallback = async () => {
    const result = await withFallback(
      async () => {
        const response = await fetch('/api/workouts');
        if (!response.ok) throw new NetworkError('Failed to fetch');
        return response.json();
      },
      {
        fallbackValue: [],
        onError: (error) => {
          errorNotification.showWarning('Utilisation des données en cache');
          errorLogger.log(error);
        },
        logError: true
      }
    );

    setData(result || []);
  };

  return (
    <div>
      {!isOnline && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded">
          Mode hors ligne - Certaines fonctionnalités sont limitées
        </div>
      )}

      <button onClick={loadDataWithRetry} disabled={loading}>
        {loading ? 'Chargement...' : 'Charger avec retry'}
      </button>

      <button onClick={loadWithTimeout} disabled={loading}>
        Charger avec timeout
      </button>

      <button onClick={loadWithFallback} disabled={loading}>
        Charger avec fallback
      </button>

      <div>{data.length} éléments</div>
    </div>
  );
}

export function SupabaseErrorExample() {
  const [workouts, setWorkouts] = useState<any[]>([]);

  const loadWorkouts = async () => {
    const { data, error } = await safeSelect(
      'workouts',
      'id, type, date, duration',
      { user_id: 'current-user-id' },
      {
        retry: true,
        maxRetries: 3,
        timeout: 10000,
        showError: true
      }
    );

    if (error) {
      console.error('Failed to load workouts:', error);
      return;
    }

    setWorkouts(data || []);
  };

  const createWorkout = async (workoutData: any) => {
    const { data, error } = await safeInsert(
      'workouts',
      workoutData,
      {
        showError: true,
        retry: false
      }
    );

    if (error) {
      console.error('Failed to create workout:', error);
      return null;
    }

    errorNotification.showSuccess('Séance créée avec succès');
    return data;
  };

  const updateWorkout = async (id: string, updates: any) => {
    const { data, error } = await safeUpdate(
      'workouts',
      id,
      updates,
      {
        showError: true
      }
    );

    if (error) {
      if (error.code === '403') {
        errorNotification.showError(
          new ApiError(
            'Permission denied',
            '403',
            undefined,
            'Vous ne pouvez pas modifier cette séance'
          )
        );
      }
      return null;
    }

    errorNotification.showSuccess('Séance mise à jour');
    return data;
  };

  const callRpcFunction = async () => {
    const { data, error } = await safeRpc(
      'get_coach_dashboard_analytics',
      { coach_user_id: 'coach-id' },
      {
        retry: true,
        timeout: 15000
      }
    );

    if (error) {
      console.error('RPC call failed:', error);
      return null;
    }

    return data;
  };

  return (
    <div>
      <button onClick={loadWorkouts}>Charger les séances</button>
      <button onClick={() => createWorkout({ type: 'course', date: new Date() })}>
        Créer une séance
      </button>
    </div>
  );
}

export function ValidationErrorExample() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const validationError = new ValidationError(
        'Validation failed',
        undefined,
        'Veuillez corriger les erreurs dans le formulaire'
      );

      errorNotification.showError(validationError);
      errorLogger.log(validationError, { fields: Object.keys(newErrors) });

      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        const appError = parseSupabaseError(error);
        errorNotification.showError(appError);
        errorLogger.log(appError);
        return;
      }

      errorNotification.showSuccess('Connexion réussie');
    } catch (error) {
      errorLogger.log(error);
      errorNotification.showError(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
        />
        {errors.email && (
          <span className="text-red-500 text-sm">{errors.email}</span>
        )}
      </div>

      <div>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Mot de passe"
        />
        {errors.password && (
          <span className="text-red-500 text-sm">{errors.password}</span>
        )}
      </div>

      <button type="submit">Se connecter</button>
    </form>
  );
}

export function CacheAndRevalidateExample() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWorkoutsWithCache = async () => {
    setLoading(true);

    const result = await staleWhileRevalidate(
      async () => {
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .order('date', { ascending: false })
          .limit(20);

        if (error) throw parseSupabaseError(error);
        return data || [];
      },
      {
        cache: workoutsCache,
        key: 'recent-workouts',
        onRevalidate: (freshData) => {
          setWorkouts(freshData);
          errorNotification.showInfo('Données mises à jour');
        },
        fallbackValue: [],
        logError: true
      }
    );

    setWorkouts(result || []);
    setLoading(false);
  };

  return (
    <div>
      <button onClick={loadWorkoutsWithCache} disabled={loading}>
        {loading ? 'Chargement...' : 'Charger les séances'}
      </button>

      <div>{workouts.length} séances</div>
    </div>
  );
}

export function OfflineSupportExample() {
  const [queue, setQueue] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const unsubscribe = networkMonitor.subscribe((online) => {
      setIsOnline(online);

      if (online) {
        processQueue();
      }
    });

    return unsubscribe;
  }, []);

  const addToQueue = (action: any) => {
    const queueItem = {
      id: Date.now(),
      action,
      timestamp: new Date().toISOString()
    };

    const updatedQueue = [...queue, queueItem];
    setQueue(updatedQueue);
    localStorage.setItem('offline-queue', JSON.stringify(updatedQueue));

    errorNotification.showInfo('Action ajoutée à la file d\'attente');
  };

  const processQueue = async () => {
    if (queue.length === 0) return;

    errorNotification.showInfo(`Traitement de ${queue.length} actions en attente...`);

    for (const item of queue) {
      try {
        await item.action();

        const updatedQueue = queue.filter(q => q.id !== item.id);
        setQueue(updatedQueue);
        localStorage.setItem('offline-queue', JSON.stringify(updatedQueue));
      } catch (error) {
        errorLogger.log(error, { queueItem: item });

        if (!navigator.onLine) {
          errorNotification.showWarning('Connexion perdue. Actions en attente.');
          break;
        }
      }
    }

    if (queue.length === 0) {
      errorNotification.showSuccess('Toutes les actions ont été synchronisées');
      localStorage.removeItem('offline-queue');
    }
  };

  const createWorkout = async (workoutData: any) => {
    if (!isOnline) {
      addToQueue(async () => {
        await supabase.from('workouts').insert(workoutData);
      });
      return;
    }

    try {
      const { error } = await supabase.from('workouts').insert(workoutData);

      if (error) {
        throw parseSupabaseError(error);
      }

      errorNotification.showSuccess('Séance créée');
    } catch (error) {
      if (error instanceof NetworkError) {
        addToQueue(async () => {
          await supabase.from('workouts').insert(workoutData);
        });
      } else {
        errorNotification.showError(error);
        errorLogger.log(error);
      }
    }
  };

  return (
    <div>
      {!isOnline && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded">
          Mode hors ligne - {queue.length} actions en attente
        </div>
      )}

      {queue.length > 0 && isOnline && (
        <button onClick={processQueue}>
          Synchroniser {queue.length} actions
        </button>
      )}

      <button onClick={() => createWorkout({ type: 'course', date: new Date() })}>
        Créer une séance
      </button>
    </div>
  );
}

export function ApiErrorHandlingExample() {
  const handleAuthError = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        const appError = parseSupabaseError(error);

        if (appError.code === '401') {
          errorNotification.showError(
            appError,
            {
              duration: false as any,
              action: {
                label: 'Se reconnecter',
                onClick: () => {
                  window.location.href = '/login';
                }
              }
            }
          );
        }

        errorLogger.log(appError);
        return;
      }

      if (!data.session) {
        window.location.href = '/login';
      }
    } catch (error) {
      errorLogger.log(error);
      errorNotification.showError(error);
    }
  };

  const handlePermissionError = async (action: string) => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', 'some-id');

      if (error) {
        const appError = parseSupabaseError(error);

        if (appError.code === '403') {
          errorNotification.showError(
            new ApiError(
              'Permission denied',
              '403',
              undefined,
              `Vous n'avez pas la permission de ${action}`
            )
          );
        } else {
          errorNotification.showError(appError);
        }

        errorLogger.log(appError, { action });
        return;
      }

      errorNotification.showSuccess(`${action} réussi`);
    } catch (error) {
      errorLogger.log(error);
      errorNotification.showError(error);
    }
  };

  return (
    <div>
      <button onClick={handleAuthError}>Vérifier la session</button>
      <button onClick={() => handlePermissionError('supprimer cette séance')}>
        Supprimer
      </button>
    </div>
  );
}
