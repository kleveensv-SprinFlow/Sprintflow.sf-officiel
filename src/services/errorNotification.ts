import { toast } from 'react-toastify';
import { AppError, ErrorSeverity, getUserFriendlyMessage } from '../utils/errors';

export interface NotificationOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
}

export class ErrorNotificationService {
  private static instance: ErrorNotificationService;

  private constructor() {}

  static getInstance(): ErrorNotificationService {
    if (!ErrorNotificationService.instance) {
      ErrorNotificationService.instance = new ErrorNotificationService();
    }
    return ErrorNotificationService.instance;
  }

  showError(error: any, options?: NotificationOptions) {
    const message = getUserFriendlyMessage(error);
    const severity = (error as AppError)?.severity || ErrorSeverity.MEDIUM;

    const toastOptions: any = {
      autoClose: options?.duration || this.getAutoCloseDuration(severity),
      closeOnClick: options?.dismissible !== false,
      pauseOnHover: true,
      draggable: true,
    };

    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        toast.error(message, toastOptions);
        break;
      case ErrorSeverity.MEDIUM:
        toast.warning(message, toastOptions);
        break;
      case ErrorSeverity.LOW:
        toast.info(message, toastOptions);
        break;
      default:
        toast.error(message, toastOptions);
    }
  }

  showSuccess(message: string, duration = 3000) {
    toast.success(message, {
      autoClose: duration,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }

  showInfo(message: string, duration = 5000) {
    toast.info(message, {
      autoClose: duration,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }

  showWarning(message: string, duration = 5000) {
    toast.warning(message, {
      autoClose: duration,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  }

  dismiss(toastId?: string | number) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }

  private getAutoCloseDuration(severity: ErrorSeverity): number {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return false as any;
      case ErrorSeverity.HIGH:
        return 8000;
      case ErrorSeverity.MEDIUM:
        return 5000;
      case ErrorSeverity.LOW:
        return 3000;
      default:
        return 5000;
    }
  }
}

export const errorNotification = ErrorNotificationService.getInstance();
