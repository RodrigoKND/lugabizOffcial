import { supabase } from '../client';
import { SocialGroup } from '../types';

export const socialGroupsService = {
  // Get all social groups
  async getSocialGroups(): Promise<SocialGroup[]> {
    const { data, error } = await supabase
      .from('social_groups')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data || []).map(group => ({
      id: group.id,
      name: group.name,
      icon: group.icon,
      color: group.color,
      description: group.description,
    }));
  },

  // Get social group by ID
  async getSocialGroupById(id: string): Promise<SocialGroup | null> {
    const { data, error } = await supabase
      .from('social_groups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      icon: data.icon,
      color: data.color,
      description: data.description,
    };
  },

  // Create social group
  async createSocialGroup(socialGroup: Omit<SocialGroup, 'id'>) {
    const { data, error } = await supabase
      .from('social_groups')
      .insert({
        name: socialGroup.name,
        icon: socialGroup.icon,
        color: socialGroup.color,
        description: socialGroup.description,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update social group
  async updateSocialGroup(id: string, updates: Partial<Omit<SocialGroup, 'id'>>) {
    const { data, error } = await supabase
      .from('social_groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete social group
  async deleteSocialGroup(id: string) {
    const { error } = await supabase
      .from('social_groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};