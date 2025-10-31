import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kqlzvxfdzandgdkqzggj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxbHp2eGZkemFuZGdka3F6Z2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTM2ODcsImV4cCI6MjA3NzIyOTY4N30.sOpb5fL1l7-yli2_Lrptz_L7ihGkZxzbGSoW2tYRn_E';

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