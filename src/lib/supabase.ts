import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'sb-auth-token'
  },
  global: {
    fetch: (url, options = {}) => {
      const urlString = url.toString();
      if (urlString.includes('avatar_url')) {
        console.warn('🔧 [Supabase] Blocking legacy avatar_url request:', urlString);
        const fixedUrl = urlString.replace(/,?\s*avatar_url/g, '');
        console.log('✅ [Supabase] Fixed URL:', fixedUrl);
        return fetch(fixedUrl, options);
      }
      return fetch(url, options);
    }
  }
});

// Fonction pour vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  return supabaseUrl &&
         supabaseAnonKey &&
         supabaseUrl.includes('supabase.co') &&
         supabaseAnonKey.length > 20;
};