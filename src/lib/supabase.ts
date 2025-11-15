import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sprintflow-auth',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'sprintflow-web',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Fonction pour vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  return supabaseUrl &&
         supabaseAnonKey &&
         supabaseUrl.includes('supabase.co') &&
         supabaseAnonKey.length > 20;
};