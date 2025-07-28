// Re-export everything from the organized structure
export * from './supabase/index';

// For backward compatibility, also export the main client
export { supabase as default } from './supabase/client';