import { useState, useEffect } from 'react';
import { errorNotification } from '../services/errorNotification';

interface OfflineStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

export function useOfflineStatus() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    wasOffline: false,
  });

  useEffect(() => {
    const handleOnline = () => {
      setStatus((prev) => {
        if (!prev.isOnline && prev.wasOffline) {
          errorNotification.showSuccess('Connexion rétablie');
        }
        return { isOnline: true, wasOffline: prev.wasOffline || !prev.isOnline };
      });
    };

    const handleOffline = () => {
      setStatus({ isOnline: false, wasOffline: true });
      errorNotification.showWarning(
        'Connexion perdue. Certaines fonctionnalités peuvent être limitées.',
        false as any
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return status;
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [effectiveType, setEffectiveType] = useState<string | null>(null);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    const updateConnectionInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        setEffectiveType(connection.effectiveType);
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      if (connection) {
        connection.removeEventListener('change', updateConnectionInfo);
      }
    };
  }, []);

  return {
    isOnline,
    effectiveType,
    isSlowConnection: effectiveType === 'slow-2g' || effectiveType === '2g',
  };
}
