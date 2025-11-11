import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 [Supabase Init] VITE_SUPABASE_URL:', supabaseUrl);
console.log('🔍 [Supabase Init] VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 5)}...` : 'Not found');

const originalFetch = fetch;
const patchedFetch = (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const urlString = url.toString();
  if (urlString.includes('avatar_url')) {
    console.warn('🔧 [Supabase Patch] Intercepted avatar_url request');
    const fixedUrl = urlString.replace(/,\s*avatar_url|avatar_url,\s*|avatar_url/g, '');
    console.log('✅ [Supabase Patch] Fixed:', fixedUrl);
    return originalFetch(fixedUrl, options);
  }
  return originalFetch(url, options);
};

window.fetch = patchedFetch as any;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Fonction pour vérifier si Supabase est configuré
export const isSupabaseConfigured = () => {
  return supabaseUrl &&
         supabaseAnonKey &&
         supabaseUrl.includes('supabase.co') &&
         supabaseAnonKey.length > 20;
};