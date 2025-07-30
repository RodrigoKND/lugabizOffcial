import { supabase } from '../client';
import { baseUrl } from '../../api/baseUrl';
import { User } from '../types';

export const authService = {
  // Sign up with email and password
  async signUp(name: string, email: string, password: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    });

    if (authError) throw authError.message;

    if (!authData.user) throw new Error("Hubo un problema al crear el usuario");

    await this.createUserProfile(authData.user.id, name, email);
    return authData;
  },

  // Resend confirmation email
  async resendConfirmation(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    });

    if (error) throw error;
    return true;
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      createdAt: new Date(data.created_at),
    };
  },

  // Create user profile
  async createUserProfile(userId: string, name: string, email: string) {
    const { error } = await supabase
      .from('users')
      .insert({
        id: userId,
        name,
        email,
        avatar: `${baseUrl}/avatar.png`,
      });

    if (error) throw error;
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<Pick<User, 'name' | 'avatar'>>) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
