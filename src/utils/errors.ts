export enum ErrorType {
  NETWORK = 'NETWORK',
  API = 'API',
  VALIDATION = 'VALIDATION',
  AUTH = 'AUTH',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION = 'PERMISSION',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  code?: string;
  details?: any;
  timestamp: number;
  retryable: boolean;
  fallbackAction?: () => void;
}

export class NetworkError extends Error implements AppError {
  type = ErrorType.NETWORK;
  severity = ErrorSeverity.MEDIUM;
  userMessage: string;
  timestamp: number;
  retryable = true;
  code?: string;
  details?: any;

  constructor(message: string, userMessage?: string, details?: any) {
    super(message);
    this.name = 'NetworkError';
    this.userMessage = userMessage || 'Erreur de connexion. Veuillez vérifier votre connexion internet.';
    this.timestamp = Date.now();
    this.details = details;
  }
}

export class ApiError extends Error implements AppError {
  type = ErrorType.API;
  severity: ErrorSeverity;
  userMessage: string;
  timestamp: number;
  retryable: boolean;
  code?: string;
  details?: any;

  constructor(
    message: string,
    code?: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    userMessage?: string,
    retryable = false
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.severity = severity;
    this.userMessage = userMessage || 'Une erreur est survenue. Veuillez réessayer.';
    this.timestamp = Date.now();
    this.retryable = retryable;
  }
}

export class ValidationError extends Error implements AppError {
  type = ErrorType.VALIDATION;
  severity = ErrorSeverity.LOW;
  userMessage: string;
  timestamp: number;
  retryable = false;
  code?: string;
  details?: any;
  field?: string;

  constructor(message: string, field?: string, userMessage?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.userMessage = userMessage || message;
    this.timestamp = Date.now();
  }
}

export class AuthError extends Error implements AppError {
  type = ErrorType.AUTH;
  severity = ErrorSeverity.HIGH;
  userMessage: string;
  timestamp: number;
  retryable = false;
  code?: string;
  details?: any;

  constructor(message: string, code?: string, userMessage?: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.userMessage = userMessage || 'Session expirée. Veuillez vous reconnecter.';
    this.timestamp = Date.now();
  }
}

export function parseSupabaseError(error: any): AppError {
  if (!error) {
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.LOW,
      message: 'Unknown error',
      userMessage: 'Une erreur inconnue est survenue',
      timestamp: Date.now(),
      retryable: false,
    };
  }

  const message = error.message || error.error_description || 'Unknown error';
  const code = error.code || error.status?.toString();

  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
    return new NetworkError(message, undefined, error);
  }

  if (code === '401' || code === 'PGRST301' || message.includes('JWT')) {
    return new AuthError(message, code);
  }

  if (code === '404' || code === 'PGRST116') {
    return new ApiError(message, code, ErrorSeverity.LOW, 'Ressource non trouvée');
  }

  if (code === '400' || code?.startsWith('22') || code?.startsWith('23')) {
    return new ApiError(message, code, ErrorSeverity.MEDIUM, 'Données invalides', false);
  }

  if (code === '403' || code === 'PGRST201') {
    return new ApiError(
      message,
      code,
      ErrorSeverity.HIGH,
      "Vous n'avez pas la permission d'effectuer cette action"
    );
  }

  if (code === '500' || code?.startsWith('5')) {
    return new ApiError(
      message,
      code,
      ErrorSeverity.HIGH,
      'Erreur serveur. Veuillez réessayer plus tard',
      true
    );
  }

  return new ApiError(message, code, ErrorSeverity.MEDIUM, undefined, false);
}

export function getUserFriendlyMessage(error: any): string {
  if (error?.userMessage) return error.userMessage;

  if (typeof error === 'string') return error;

  if (error?.message) {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'Problème de connexion. Vérifiez votre connexion internet.';
    }

    if (message.includes('timeout')) {
      return 'La requête a pris trop de temps. Veuillez réessayer.';
    }

    if (message.includes('unauthorized') || message.includes('401')) {
      return 'Session expirée. Veuillez vous reconnecter.';
    }

    if (message.includes('forbidden') || message.includes('403')) {
      return "Vous n'avez pas la permission d'effectuer cette action.";
    }

    if (message.includes('not found') || message.includes('404')) {
      return 'Ressource non trouvée.';
    }

    if (message.includes('already exists') || message.includes('duplicate')) {
      return 'Cette ressource existe déjà.';
    }

    return error.message;
  }

  return 'Une erreur inattendue est survenue.';
}

export function isRetryableError(error: any): boolean {
  if (error?.retryable !== undefined) return error.retryable;

  if (!error) return false;

  const code = error.code || error.status?.toString();
  const message = error.message?.toLowerCase() || '';

  if (message.includes('network') || message.includes('timeout')) return true;
  if (code === '500' || code === '502' || code === '503' || code === '504') return true;
  if (code === '429') return true;

  return false;
}

export function shouldLogError(error: any): boolean {
  if (!error) return false;

  const severity = error.severity || ErrorSeverity.MEDIUM;

  if (severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL) return true;

  if (error.type === ErrorType.API && error.code?.startsWith('5')) return true;

  return false;
}
