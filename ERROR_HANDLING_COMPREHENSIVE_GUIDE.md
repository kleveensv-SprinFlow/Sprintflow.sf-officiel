# Comprehensive Error Handling Guide

## Overview

This application has a complete error handling system with:
- Custom error types for different scenarios
- Automatic retry logic with exponential backoff
- Graceful degradation with fallbacks
- Offline support and network monitoring
- User-friendly notifications
- Centralized error logging
- React Error Boundaries

## Table of Contents

1. [Error Types](#error-types)
2. [Network Errors](#network-errors)
3. [API Errors](#api-errors)
4. [Validation Errors](#validation-errors)
5. [Graceful Degradation](#graceful-degradation)
6. [Offline Support](#offline-support)
7. [Error Logging](#error-logging)
8. [User Notifications](#user-notifications)
9. [Best Practices](#best-practices)

---

## Error Types

The application defines custom error types in `src/utils/errors.ts`:

### Available Error Types

```typescript
enum ErrorType {
  NETWORK = 'NETWORK',        // Network/connectivity issues
  API = 'API',                // API/server errors
  VALIDATION = 'VALIDATION',  // Input validation errors
  AUTH = 'AUTH',              // Authentication errors
  NOT_FOUND = 'NOT_FOUND',    // Resource not found
  PERMISSION = 'PERMISSION',  // Permission denied
  TIMEOUT = 'TIMEOUT',        // Request timeout
  UNKNOWN = 'UNKNOWN',        // Unknown errors
}
```

### Error Severity

```typescript
enum ErrorSeverity {
  LOW = 'LOW',           // Informational
  MEDIUM = 'MEDIUM',     // Warning
  HIGH = 'HIGH',         // Error
  CRITICAL = 'CRITICAL', // Critical error
}
```

### Custom Error Classes

```typescript
// Network connection issues
new NetworkError(
  'Connection failed',
  'Impossible de se connecter au serveur',
  { status: 0 }
);

// API errors (400, 500, etc.)
new ApiError(
  'Server error',
  '500',
  ErrorSeverity.HIGH,
  'Le serveur a rencontré une erreur',
  true // retryable
);

// Validation errors
new ValidationError(
  'Invalid email',
  'email',
  'L\'adresse email est invalide'
);

// Authentication errors
new AuthError(
  'Token expired',
  '401',
  'Votre session a expiré. Veuillez vous reconnecter.'
);
```

---

## Network Errors

### Basic Retry Logic

```typescript
import { withRetry } from '../utils/networkHandlers';

const data = await withRetry(
  async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Failed');
    return response.json();
  },
  {
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 2,
    maxDelay: 10000,
    onRetry: (attempt, error) => {
      console.log(`Retry ${attempt}/3`, error);
    }
  }
);
```

### Timeout Handling

```typescript
import { withTimeout } from '../utils/networkHandlers';

try {
  const data = await withTimeout(
    fetch('/api/slow-endpoint').then(r => r.json()),
    5000 // 5 second timeout
  );
} catch (error) {
  if (error.message.includes('timeout')) {
    // Handle timeout specifically
    errorNotification.showError(
      error,
      {
        action: {
          label: 'Réessayer',
          onClick: retryFunction
        }
      }
    );
  }
}
```

### Retry with Timeout

```typescript
import { withRetryAndTimeout } from '../utils/networkHandlers';

const data = await withRetryAndTimeout(
  async () => {
    const response = await fetch('/api/data');
    return response.json();
  },
  10000, // 10 second timeout
  {
    maxRetries: 3,
    initialDelay: 1000
  }
);
```

### Network Status Monitoring

```typescript
import { networkMonitor } from '../utils/networkHandlers';

// Subscribe to network status changes
useEffect(() => {
  const unsubscribe = networkMonitor.subscribe((isOnline) => {
    if (isOnline) {
      errorNotification.showSuccess('Connexion rétablie');
      reloadData();
    } else {
      errorNotification.showWarning('Connexion perdue');
    }
  });

  return unsubscribe;
}, []);

// Check current status
const isOnline = networkMonitor.getStatus();
```

---

## API Errors

### Safe Supabase Queries

```typescript
import { safeSelect, safeInsert, safeUpdate, safeRpc } from '../lib/supabaseWithErrorHandling';

// SELECT with automatic error handling
const { data, error } = await safeSelect(
  'workouts',
  'id, type, date, duration',
  { user_id: currentUserId },
  {
    retry: true,
    maxRetries: 3,
    timeout: 10000,
    showError: true // Shows toast notification
  }
);

if (error) {
  // Error already logged and shown to user
  console.error('Query failed:', error);
  return;
}

// INSERT
const { data, error } = await safeInsert(
  'workouts',
  { type: 'course', date: new Date() },
  { showError: true, retry: false }
);

// UPDATE
const { data, error } = await safeUpdate(
  'workouts',
  workoutId,
  { duration: 3600 },
  { showError: true }
);

// RPC function call
const { data, error } = await safeRpc(
  'get_coach_dashboard_analytics',
  { coach_user_id: coachId },
  { retry: true, timeout: 15000 }
);
```

### Handling Specific HTTP Codes

```typescript
import { parseSupabaseError } from '../utils/errors';

try {
  const { data, error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId);

  if (error) {
    const appError = parseSupabaseError(error);

    switch (appError.code) {
      case '401':
        // Unauthorized - redirect to login
        window.location.href = '/login';
        break;

      case '403':
        // Forbidden - show permission error
        errorNotification.showError(
          new ApiError(
            'Permission denied',
            '403',
            undefined,
            'Vous n\'avez pas la permission de supprimer cette séance'
          )
        );
        break;

      case '404':
        // Not found
        errorNotification.showInfo('Cette séance n\'existe plus');
        break;

      case '500':
      case '502':
      case '503':
        // Server errors - these are retryable
        errorNotification.showError(appError, {
          action: {
            label: 'Réessayer',
            onClick: retryFunction
          }
        });
        break;

      default:
        errorNotification.showError(appError);
    }

    errorLogger.log(appError);
  }
} catch (error) {
  errorLogger.log(error);
  errorNotification.showError(error);
}
```

---

## Validation Errors

### Form Validation

```typescript
import { ValidationError } from '../utils/errors';

const validateForm = (formData: any) => {
  const errors: Record<string, string> = {};

  if (!formData.email) {
    errors.email = 'Email requis';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email invalide';
  }

  if (!formData.password) {
    errors.password = 'Mot de passe requis';
  } else if (formData.password.length < 8) {
    errors.password = 'Minimum 8 caractères';
  }

  if (Object.keys(errors).length > 0) {
    const validationError = new ValidationError(
      'Form validation failed',
      undefined,
      'Veuillez corriger les erreurs dans le formulaire'
    );

    errorNotification.showError(validationError);
    errorLogger.log(validationError, { fields: Object.keys(errors) });

    return { valid: false, errors };
  }

  return { valid: true, errors: {} };
};
```

### Input Validation Helper

```typescript
import { ValidationError } from '../utils/errors';

export const validators = {
  email: (value: string) => {
    if (!value) return 'Email requis';
    if (!/\S+@\S+\.\S+/.test(value)) return 'Email invalide';
    return null;
  },

  password: (value: string) => {
    if (!value) return 'Mot de passe requis';
    if (value.length < 8) return 'Minimum 8 caractères';
    if (!/[A-Z]/.test(value)) return 'Au moins une majuscule requise';
    if (!/[0-9]/.test(value)) return 'Au moins un chiffre requis';
    return null;
  },

  required: (value: any, fieldName: string) => {
    if (!value) return `${fieldName} est requis`;
    return null;
  },

  number: (value: any, fieldName: string) => {
    if (isNaN(Number(value))) return `${fieldName} doit être un nombre`;
    return null;
  },

  min: (value: number, min: number, fieldName: string) => {
    if (value < min) return `${fieldName} doit être au moins ${min}`;
    return null;
  },

  max: (value: number, max: number, fieldName: string) => {
    if (value > max) return `${fieldName} ne peut pas dépasser ${max}`;
    return null;
  }
};
```

---

## Graceful Degradation

### Using Fallback Values

```typescript
import { withFallback } from '../utils/gracefulDegradation';

// If the API fails, return an empty array
const workouts = await withFallback(
  async () => {
    const response = await fetch('/api/workouts');
    if (!response.ok) throw new Error('Failed');
    return response.json();
  },
  {
    fallbackValue: [],
    onError: (error) => {
      errorNotification.showWarning('Utilisation des données en cache');
    },
    logError: true,
    silent: false
  }
);
```

### Caching with Stale-While-Revalidate

```typescript
import { staleWhileRevalidate, Cache } from '../utils/gracefulDegradation';

const workoutsCache = new Cache<any[]>(300000); // 5 minutes TTL

const workouts = await staleWhileRevalidate(
  async () => {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw parseSupabaseError(error);
    return data || [];
  },
  {
    cache: workoutsCache,
    key: 'recent-workouts',
    onRevalidate: (freshData) => {
      // Update UI with fresh data
      setWorkouts(freshData);
      errorNotification.showInfo('Données mises à jour');
    },
    fallbackValue: [],
    logError: true
  }
);
```

### Feature Flags for Graceful Degradation

```typescript
import { featureFlags, withFeatureFlag } from '../utils/gracefulDegradation';

// Enable/disable features dynamically
featureFlags.enable('video-analysis');
featureFlags.disable('notifications');

// Use feature with fallback
const result = withFeatureFlag(
  'video-analysis',
  () => {
    // This code only runs if feature is enabled
    return analyzeVideo(videoFile);
  },
  () => {
    // Fallback if feature is disabled
    return null;
  }
);

// Async version
const result = await withFeatureFlagAsync(
  'advanced-analytics',
  async () => {
    return await fetchAdvancedAnalytics();
  },
  async () => {
    return await fetchBasicAnalytics();
  }
);
```

---

## Offline Support

### Detecting Offline State

```typescript
import { useEffect, useState } from 'react';
import { networkMonitor } from '../utils/networkHandlers';

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const unsubscribe = networkMonitor.subscribe(setIsOnline);
    return unsubscribe;
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded">
      Mode hors ligne - Certaines fonctionnalités sont limitées
    </div>
  );
}
```

### Offline Queue

```typescript
interface QueueItem {
  id: number;
  action: () => Promise<void>;
  timestamp: string;
}

class OfflineQueue {
  private queue: QueueItem[] = [];
  private storageKey = 'offline-queue';

  constructor() {
    this.loadFromStorage();
    this.setupNetworkListener();
  }

  private loadFromStorage() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      this.queue = JSON.parse(stored);
    }
  }

  private saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
  }

  private setupNetworkListener() {
    networkMonitor.subscribe((isOnline) => {
      if (isOnline) {
        this.processQueue();
      }
    });
  }

  add(action: () => Promise<void>) {
    const item: QueueItem = {
      id: Date.now(),
      action,
      timestamp: new Date().toISOString()
    };

    this.queue.push(item);
    this.saveToStorage();

    errorNotification.showInfo('Action ajoutée à la file d\'attente');
  }

  async processQueue() {
    if (this.queue.length === 0) return;

    errorNotification.showInfo(`Synchronisation de ${this.queue.length} actions...`);

    for (const item of [...this.queue]) {
      try {
        await item.action();

        this.queue = this.queue.filter(q => q.id !== item.id);
        this.saveToStorage();
      } catch (error) {
        errorLogger.log(error, { queueItem: item });

        if (!navigator.onLine) {
          errorNotification.showWarning('Connexion perdue pendant la synchronisation');
          break;
        }
      }
    }

    if (this.queue.length === 0) {
      errorNotification.showSuccess('Synchronisation terminée');
      localStorage.removeItem(this.storageKey);
    }
  }

  getQueueLength() {
    return this.queue.length;
  }
}

export const offlineQueue = new OfflineQueue();
```

### Usage in Components

```typescript
import { offlineQueue } from '../services/offlineQueue';
import { networkMonitor } from '../utils/networkHandlers';

function CreateWorkoutForm() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const unsubscribe = networkMonitor.subscribe(setIsOnline);
    return unsubscribe;
  }, []);

  const createWorkout = async (workoutData: any) => {
    if (!isOnline) {
      // Queue the action for later
      offlineQueue.add(async () => {
        await supabase.from('workouts').insert(workoutData);
      });
      errorNotification.showInfo('La séance sera créée lorsque vous serez en ligne');
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
        // Network error - queue for later
        offlineQueue.add(async () => {
          await supabase.from('workouts').insert(workoutData);
        });
      } else {
        // Other error - show immediately
        errorNotification.showError(error);
        errorLogger.log(error);
      }
    }
  };

  return (
    <div>
      {!isOnline && (
        <div className="bg-yellow-100 p-2 mb-4">
          Mode hors ligne - {offlineQueue.getQueueLength()} actions en attente
        </div>
      )}
      {/* Form fields */}
    </div>
  );
}
```

---

## Error Logging

### Automatic Error Logging

```typescript
import { errorLogger } from '../services/errorLogger';

// Errors are automatically logged if they meet severity criteria
try {
  await someOperation();
} catch (error) {
  // This logs the error if severity is HIGH or CRITICAL
  errorLogger.log(error);
}

// Log with additional context
errorLogger.log(error, {
  userId: currentUser.id,
  action: 'create_workout',
  data: workoutData
});

// Log multiple errors
errorLogger.logBatch([error1, error2, error3]);

// Clear the error queue (useful for testing)
errorLogger.clearQueue();
```

### Error Log Structure

Errors are logged with the following information:

```typescript
{
  timestamp: '2025-11-11T10:30:00.000Z',
  error_type: 'NetworkError',
  error_code: '500',
  message: 'Connection failed',
  stack: 'Error: Connection failed\n    at...',
  user_id: 'user-123',
  url: 'https://app.example.com/workouts',
  user_agent: 'Mozilla/5.0...',
  severity: 'HIGH',
  additional_data: {
    action: 'create_workout',
    data: { ... }
  }
}
```

---

## User Notifications

### Basic Notifications

```typescript
import { errorNotification } from '../services/errorNotification';

// Error notifications (automatically styled by severity)
errorNotification.showError(error);

// Success
errorNotification.showSuccess('Opération réussie');

// Info
errorNotification.showInfo('Information importante');

// Warning
errorNotification.showWarning('Attention requise');
```

### Notifications with Actions

```typescript
errorNotification.showError(
  error,
  {
    duration: 8000,
    dismissible: true,
    action: {
      label: 'Réessayer',
      onClick: () => {
        retryOperation();
      }
    }
  }
);
```

### Dismissing Notifications

```typescript
// Dismiss specific notification
const toastId = errorNotification.showInfo('Message');
errorNotification.dismiss(toastId);

// Dismiss all notifications
errorNotification.dismiss();
```

---

## Best Practices

### 1. Always Use Safe Query Helpers

**Good:**
```typescript
const { data, error } = await safeSelect('workouts', '*', { user_id });
```

**Bad:**
```typescript
const { data, error } = await supabase.from('workouts').select('*');
// No retry, no timeout, no user notification
```

### 2. Provide User-Friendly Messages

**Good:**
```typescript
new ApiError(
  'HTTP 500: Internal Server Error',
  '500',
  ErrorSeverity.HIGH,
  'Le serveur a rencontré une erreur. Veuillez réessayer dans quelques instants.',
  true
);
```

**Bad:**
```typescript
throw new Error('HTTP 500');
```

### 3. Handle Network Errors Gracefully

**Good:**
```typescript
try {
  const data = await fetchData();
} catch (error) {
  if (error instanceof NetworkError) {
    // Provide fallback or queue for later
    return cachedData;
  }
  throw error;
}
```

**Bad:**
```typescript
try {
  const data = await fetchData();
} catch (error) {
  console.error(error);
  // App crashes
}
```

### 4. Log Errors with Context

**Good:**
```typescript
errorLogger.log(error, {
  userId: user.id,
  action: 'update_profile',
  previousValue: oldData,
  newValue: newData
});
```

**Bad:**
```typescript
console.error(error);
```

### 5. Use Error Boundaries

```typescript
import { ErrorBoundary } from '../components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        errorLogger.log(error, { componentStack: errorInfo.componentStack });
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

### 6. Validate Before Submitting

**Good:**
```typescript
const validation = validateForm(formData);
if (!validation.valid) {
  // Show errors to user
  return;
}

// Proceed with submission
await submitForm(formData);
```

**Bad:**
```typescript
// Submit and let the server validate
await submitForm(formData);
```

### 7. Handle Auth Errors Appropriately

```typescript
if (error.code === '401') {
  // Clear session and redirect
  await supabase.auth.signOut();
  window.location.href = '/login';
}
```

### 8. Use Retry for Transient Errors

```typescript
const data = await withRetry(
  () => fetchData(),
  {
    maxRetries: 3,
    onRetry: (attempt) => {
      errorNotification.showInfo(`Tentative ${attempt}...`);
    }
  }
);
```

### 9. Implement Timeout for Long Operations

```typescript
const data = await withTimeout(
  longRunningOperation(),
  30000 // 30 seconds
);
```

### 10. Provide Offline Support

```typescript
if (!navigator.onLine) {
  // Queue action or use cached data
  offlineQueue.add(() => performAction());
  return cachedData;
}
```

---

## Summary

Your application has comprehensive error handling:

1. **Custom Error Types** - Specific error classes for different scenarios
2. **Retry Logic** - Automatic retry with exponential backoff
3. **Timeout Handling** - Prevent requests from hanging
4. **Graceful Degradation** - Fallback values and caching
5. **Offline Support** - Queue actions and detect network status
6. **Error Logging** - Centralized logging with context
7. **User Notifications** - Toast notifications with severity-based styling
8. **Error Boundaries** - Catch React rendering errors

Use the examples in `src/examples/errorHandlingExamples.tsx` as a reference for implementing error handling in your components.
