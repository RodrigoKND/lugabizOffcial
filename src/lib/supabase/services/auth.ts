import { supabase } from '../client';
import { baseUrl } from '../../api/baseUrl';
import { User } from '../types';
import { OAuthResponse } from '@supabase/supabase-js';
import { ProvidersOauth } from '@/types';

export const authService = {
  // Sign up with email and password
  async signUp(name: string, email: string, password: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://lugabiz.vercel.app/confirmation"
      }
    })

    if (authError) throw authError.message;

    if (!authData.user) throw new Error("Hubo un problema al crear el usuario");

    await this.createUserProfile(authData.user.id, name, email);
    return authData;
  },

  async signInGoogle(): Promise<OAuthResponse> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: "http://localhost:5173"
      }
    })

    if (error) throw new Error(error.message);

    return data as unknown as OAuthResponse;
  },

  async isLoggedWithOauth(provider: ProvidersOauth) {
    try {
      const currentUser = await this.getCurrentUser();
      const infoUser = currentUser?.user_metadata;
      const isLogged = currentUser?.app_metadata.provider === provider;
      if (!isLogged) return;
      if (!currentUser) return;

      await this.createUserProfile(currentUser?.id,
        infoUser?.name,
        infoUser?.email);

    }catch(error) {
      console.log(error)
      throw new Error("Hubo un error al inicio de sesión de: " + provider);
    }
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
      .upsert({
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

  async getSession(): Promise<{ id: string; email: string; avatar_url?: string; name?: string } | undefined> {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw new Error("Error de sesión");
    if (!data.session) return;

    const { id, email, avatar_url, name } = data.session.user.user_metadata;

    return { id, email, avatar_url, name };
  }

};
