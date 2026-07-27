import { supabase } from '@lib/supabase/client';

export const usernameService = {
  async isAvailable(username: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('username_available', { p_username: username });
    if (error) throw error;
    return !!data;
  },
};
