import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import useAuth from './useAuth';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

async function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    if (!VAPID_PUBLIC_KEY) {
      console.error("VITE_VAPID_PUBLIC_KEY is not defined in your .env file. Push notifications will be disabled.");
      setError("Push notifications are not configured on this server.");
      return;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setError("Push notifications are not supported by this browser.");
      return;
    }

    const registerAndSubscribe = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        let sub = await registration.pushManager.getSubscription();

        if (sub === null) {
          const applicationServerKey = await urlBase64ToUint8Array(VAPID_PUBLIC_KEY!);
          sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          });
        }

        // Send subscription to backend
        const { error: dbError } = await supabase
          .from('push_subscriptions')
          .insert({ user_id: user.id, subscription: sub.toJSON() });
        
        if (dbError) {
            // It might fail on UNIQUE constraint, which is fine.
            console.warn("Could not save subscription:", dbError);
        }

        setSubscription(sub);
      } catch (e) {
        console.error("Error subscribing to push notifications:", e);
        setError("Failed to subscribe to push notifications.");
      }
    };

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        registerAndSubscribe();
      } else {
        setError("Permission for notifications was denied.");
      }
    });
  }, [user]);

  return { subscription, error };
}
