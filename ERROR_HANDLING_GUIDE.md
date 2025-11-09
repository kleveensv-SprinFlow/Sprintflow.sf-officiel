# Guide Complet de Gestion des Erreurs

Ce guide explique comment utiliser le système de gestion des erreurs complet implémenté dans SprintFlow.

## Table des matières

1. [Architecture](#architecture)
2. [Types d'erreurs](#types-derreurs)
3. [Gestion des erreurs réseau](#gestion-des-erreurs-réseau)
4. [Validation](#validation)
5. [Dégradation gracieuse](#dégradation-gracieuse)
6. [Support hors ligne](#support-hors-ligne)
7. [Logging](#logging)
8. [Exemples pratiques](#exemples-pratiques)

---

## Architecture

Le système de gestion des erreurs est composé de plusieurs couches :

```
┌─────────────────────────────────────────┐
│   Composants React (UI)                 │
├─────────────────────────────────────────┤
│   ErrorBoundary + Notifications         │
├─────────────────────────────────────────┤
│   Services (errorNotification, logger)  │
├─────────────────────────────────────────┤
│   Utils (errors, networkHandlers, etc)  │
├─────────────────────────────────────────┤
│   Supabase Client                       │
└─────────────────────────────────────────┘
```

---

## Types d'erreurs

### Classes d'erreurs disponibles

```typescript
import {
  NetworkError,
  ApiError,
  ValidationError,
  AuthError,
  ErrorType,
  ErrorSeverity
} from './utils/errors';

// Erreur réseau
throw new NetworkError(
  'Connection failed',
  'Impossible de se connecter au serveur'
);

// Erreur API
throw new ApiError(
  'Resource not found',
  '404',
  ErrorSeverity.MEDIUM,
  'La ressource demandée est introuvable'
);

// Erreur de validation
throw new ValidationError(
  'Invalid email format',
  'email',
  'Format d\'email invalide'
);

// Erreur d'authentification
throw new AuthError(
  'Token expired',
  '401',
  'Votre session a expiré'
);
```

### Parser automatiquement les erreurs Supabase

```typescript
import { parseSupabaseError } from './utils/errors';

try {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    const appError = parseSupabaseError(error);
    console.error(appError.userMessage); // Message friendly
  }
} catch (error) {
  const appError = parseSupabaseError(error);
  // Gestion automatique du type d'erreur
}
```

---

## Gestion des erreurs réseau

### Retry automatique

```typescript
import { withRetry } from './utils/networkHandlers';

// Retry avec backoff exponentiel
const data = await withRetry(
  async () => {
    const response = await fetch('/api/data');
    return response.json();
  },
  {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    onRetry: (attempt, error) => {
      console.log(`Tentative ${attempt}/3`);
    }
  }
);
```

### Timeout

```typescript
import { withTimeout } from './utils/networkHandlers';

// Ajouter un timeout
const data = await withTimeout(
  fetch('/api/slow-endpoint').then(r => r.json()),
  5000 // 5 secondes
);
```

### Retry + Timeout combinés

```typescript
import { withRetryAndTimeout } from './utils/networkHandlers';

const data = await withRetryAndTimeout(
  async () => {
    const response = await fetch('/api/data');
    return response.json();
  },
  10000, // timeout de 10s
  { maxRetries: 3 }
);
```

### Fetch avec retry intégré

```typescript
import { fetchWithRetry } from './utils/networkHandlers';

const response = await fetchWithRetry(
  'https://api.example.com/data',
  {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  },
  { maxRetries: 3 }
);

const data = await response.json();
```

---

## Validation

### Règles de validation disponibles

```typescript
import {
  required,
  email,
  minLength,
  maxLength,
  pattern,
  min,
  max,
  phoneNumber,
  url,
  custom,
  validateForm
} from './utils/validation';

const formData = {
  email: 'user@example.com',
  password: 'secret123',
  age: 25,
  phone: '+33 6 12 34 56 78'
};

const result = validateForm(formData, {
  email: [required(), email()],
  password: [required(), minLength(8)],
  age: [required(), min(18), max(120)],
  phone: [phoneNumber()]
});

if (!result.isValid) {
  console.error(result.errors);
  // { email: 'Email invalide', password: 'Minimum 8 caractères requis' }
}
```

### Validator réutilisable

```typescript
import { Validator } from './utils/validation';

const userValidator = new Validator<User>()
  .field('email', required(), email())
  .field('password', required(), minLength(8))
  .field('age', min(18), max(120));

// Utilisation
const result = userValidator.validate(userData);

// Ou lancer une exception
try {
  userValidator.validateOrThrow(userData);
} catch (error) {
  console.error(error.message); // Message d'erreur friendly
}
```

### Validation personnalisée

```typescript
import { custom } from './utils/validation';

const strongPassword = custom(
  (value: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value);
  },
  'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial'
);
```

---

## Dégradation gracieuse

### Fallback automatique

```typescript
import { withFallback } from './utils/gracefulDegradation';

// Si l'opération échoue, retourner une valeur par défaut
const userData = await withFallback(
  async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data;
  },
  {
    fallbackValue: [],
    onError: (error) => console.warn('Failed to load users', error),
    silent: false
  }
);
```

### Cache avec TTL

```typescript
import { Cache, withCache } from './utils/gracefulDegradation';

const userCache = new Cache<User[]>(300000); // TTL 5 minutes

const users = await withCache(
  'users-list',
  async () => {
    const { data } = await supabase.from('profiles').select('*');
    return data;
  },
  userCache
);
```

### Stale-While-Revalidate

```typescript
import { staleWhileRevalidate, Cache } from './utils/gracefulDegradation';

const cache = new Cache<User[]>();

const users = await staleWhileRevalidate(
  async () => {
    const { data } = await supabase.from('profiles').select('*');
    return data;
  },
  {
    cache,
    key: 'users',
    onRevalidate: (freshData) => {
      console.log('Data revalidated', freshData);
      // Mettre à jour l'UI avec les nouvelles données
    }
  }
);

// Retourne immédiatement les données en cache
// ET rafraîchit en arrière-plan
```

### Feature Flags

```typescript
import { featureFlags, withFeatureFlag } from './utils/gracefulDegradation';

// Activer une fonctionnalité
featureFlags.enable('new-dashboard');

// Utiliser avec fallback
const dashboard = withFeatureFlag(
  'new-dashboard',
  () => <NewDashboard />,
  () => <OldDashboard />
);

// Version async
const data = await withFeatureFlagAsync(
  'new-api',
  async () => fetchFromNewAPI(),
  async () => fetchFromOldAPI()
);
```

---

## Support hors ligne

### Hook de détection

```typescript
import { useOfflineStatus } from './hooks/useOfflineStatus';

function MyComponent() {
  const { isOnline, wasOffline } = useOfflineStatus();

  if (!isOnline) {
    return <div>Mode hors ligne activé</div>;
  }

  return <div>Connecté</div>;
}
```

### Indicateur visuel

```typescript
import { OfflineIndicator } from './components/common/OfflineIndicator';

function App() {
  return (
    <>
      <OfflineIndicator />
      {/* Affiche une bannière quand hors ligne */}
      <MainContent />
    </>
  );
}
```

### Moniteur réseau

```typescript
import { networkMonitor } from './utils/networkHandlers';

// S'abonner aux changements
const unsubscribe = networkMonitor.subscribe((isOnline) => {
  if (isOnline) {
    console.log('Connexion rétablie');
    syncPendingData();
  } else {
    console.log('Connexion perdue');
    saveDataLocally();
  }
});

// Nettoyer
unsubscribe();
```

---

## Logging

### Logger les erreurs

```typescript
import { errorLogger } from './services/errorLogger';

try {
  await riskyOperation();
} catch (error) {
  // Log automatique pour les erreurs importantes
  await errorLogger.log(error, {
    context: 'user-profile-update',
    userId: user.id,
    timestamp: new Date().toISOString()
  });
}
```

### Batch logging

```typescript
import { errorLogger } from './services/errorLogger';

const errors = [];

for (const item of items) {
  try {
    await processItem(item);
  } catch (error) {
    errors.push(error);
  }
}

// Logger tous les erreurs en une fois
await errorLogger.logBatch(errors);
```

---

## Exemples pratiques

### 1. Formulaire avec validation

```typescript
import { useState } from 'react';
import { validateForm, required, email, minLength } from './utils/validation';
import { errorNotification } from './services/errorNotification';

function SignupForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const validation = validateForm(formData, {
      email: [required(), email()],
      password: [required(), minLength(8)]
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      // Enregistrement avec retry
      const { data, error } = await safeInsert('users', formData, {
        retry: true,
        showError: true
      });

      if (error) throw error;

      errorNotification.showSuccess('Inscription réussie !');
    } catch (error) {
      // Déjà géré par safeInsert
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      {errors.email && <span className="error">{errors.email}</span>}

      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      {errors.password && <span className="error">{errors.password}</span>}

      <button type="submit">S'inscrire</button>
    </form>
  );
}
```

### 2. Liste avec fallback et cache

```typescript
import { useState, useEffect } from 'react';
import { Cache, staleWhileRevalidate } from './utils/gracefulDegradation';
import { safeSelect } from './lib/supabaseWithErrorHandling';

const usersCache = new Cache<User[]>(300000);

function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await staleWhileRevalidate(
      async () => {
        const { data } = await safeSelect<User>('profiles', '*', {}, {
          retry: true,
          timeout: 10000
        });
        return data || [];
      },
      {
        cache: usersCache,
        key: 'users-list',
        fallbackValue: [],
        onRevalidate: (freshData) => {
          setUsers(freshData);
        }
      }
    );

    setUsers(data || []);
    setLoading(false);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### 3. Application avec ErrorBoundary

```typescript
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { errorLogger } from './services/errorLogger';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        errorLogger.log(error, { componentStack: errorInfo.componentStack });
      }}
    >
      <OfflineIndicator />
      <MainApp />
    </ErrorBoundary>
  );
}
```

---

## Bonnes pratiques

1. **Toujours valider les entrées utilisateur** avant de les envoyer au serveur
2. **Utiliser safeQuery** plutôt que les appels Supabase directs
3. **Implémenter des fallbacks** pour les fonctionnalités non-critiques
4. **Logger les erreurs importantes** pour le debugging
5. **Afficher des messages user-friendly** plutôt que des erreurs techniques
6. **Utiliser le retry** uniquement pour les erreurs réseau/temporaires
7. **Implémenter le cache** pour les données fréquemment accédées
8. **Tester le mode hors ligne** régulièrement

---

## Tests

```typescript
// Tester la validation
import { validateForm, required, email } from './utils/validation';

test('validation should reject invalid email', () => {
  const result = validateForm(
    { email: 'invalid-email' },
    { email: [required(), email()] }
  );

  expect(result.isValid).toBe(false);
  expect(result.errors.email).toBeDefined();
});

// Tester le retry
import { withRetry } from './utils/networkHandlers';

test('should retry failed requests', async () => {
  let attempts = 0;
  const fn = jest.fn(async () => {
    attempts++;
    if (attempts < 3) throw new Error('Fail');
    return 'success';
  });

  const result = await withRetry(fn, { maxRetries: 3 });

  expect(result).toBe('success');
  expect(fn).toHaveBeenCalledTimes(3);
});
```

---

## Migration du code existant

Pour migrer votre code existant :

1. Remplacer les appels Supabase directs par `safeQuery`/`safeSelect`/etc
2. Ajouter validation sur les formulaires
3. Wrapper les opérations critiques avec `withRetry`
4. Implémenter le cache pour les données fréquentes
5. Ajouter `ErrorBoundary` au niveau racine
6. Utiliser `errorNotification` pour les messages utilisateur

### Avant
```typescript
const { data, error } = await supabase.from('profiles').select('*');
if (error) alert('Erreur');
```

### Après
```typescript
const { data, error } = await safeSelect('profiles', '*', {}, {
  retry: true,
  showError: true
});
```

---

## Support

Pour toute question ou problème, référez-vous à cette documentation ou consultez le code source des utils et services.
