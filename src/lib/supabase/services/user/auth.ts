import { supabase } from '@lib/supabase';
import { User } from '@domain/entities';

export const authService = {
  async signUp(name: string, email: string, password: string) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError.message;
    if (!authData.user) throw new Error('Hubo un problema al crear el usuario');

    await this.createUserProfile(authData.user.id, name, email);
    return authData;
  },

  async resendConfirmation(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) throw error;
    return true;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getUserProfile(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return this.transformUserData(data);
  },

  async createUserProfile(userId: string, name: string, email: string) {
    const { error } = await supabase
      .from('users')
      .insert({
        id: userId,
        name,
        email,
        avatar: `${window.location.origin}/avatar.png`,
      });

    if (error) throw error;
  },

  async updateUserProfile(userId: string, updates: Partial<Pick<User, 'name' | 'avatar' | 'phone' | 'bio' | 'isOwner' | 'ownerBusinessName'>>) {
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.isOwner !== undefined) dbUpdates.is_owner = updates.isOwner;
    if (updates.ownerBusinessName !== undefined) dbUpdates.owner_business_name = updates.ownerBusinessName;

    const { data, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    if (updates.isOwner !== undefined) {
      await supabase.from('user_roles').upsert(
        { user_id: userId, role: updates.isOwner ? 'owner' : 'user' },
        { onConflict: 'user_id' }
      );
    }

    return this.transformUserData(data);
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) throw error;
    const { data } = supabase.storage.from('images').getPublicUrl(filePath);

    await this.updateUserProfile(userId, { avatar: data.publicUrl });
    return data.publicUrl;
  },

  async saveUserPreferences(userId: string, categories: string[], socialGroups: string[]) {
    await supabase.from('user_category_preferences').delete().eq('user_id', userId);
    await supabase.from('user_social_group_preferences').delete().eq('user_id', userId);

    if (categories.length > 0) {
      const { error } = await supabase.from('user_category_preferences').insert(
        categories.map(category_id => ({ user_id: userId, category_id }))
      );
      if (error) throw error;
    }

    if (socialGroups.length > 0) {
      const { error } = await supabase.from('user_social_group_preferences').insert(
        socialGroups.map(social_group_id => ({ user_id: userId, social_group_id }))
      );
      if (error) throw error;
    }
  },

  async getUserRole(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.role || null;
  },

  async updateOnboardingState(userId: string, step: string, notifDismissed: boolean, geoDismissed: boolean): Promise<void> {
    await supabase
      .from('users')
      .update({ onboarding_step: step, notif_dismissed: notifDismissed, geo_dismissed: geoDismissed })
      .eq('id', userId);
  },

  transformUserData(data: any): User {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      phone: data.phone,
      bio: data.bio,
      isOwner: data.is_owner || false,
      ownerBusinessName: data.owner_business_name,
      banned: data.banned || false,
      banReason: data.ban_reason,
      createdAt: new Date(data.created_at),
      onboardingStep: data.onboarding_step ?? 'login',
      notifDismissed: data.notif_dismissed ?? false,
      geoDismissed: data.geo_dismissed ?? false,
    };
  },
};
