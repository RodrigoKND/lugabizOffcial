import { createClient } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseUrl } from '@infrastructure/config/supabase';
import { Database } from './types';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

export default supabase;