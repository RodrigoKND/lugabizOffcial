import { supabase } from '@lib/supabase/client'

export const edgeService = {
  async createOwnerAnnouncement(title: string, body: string, data?: Record<string, unknown>, targetUsers?: string[]) {
    const { data: result, error } = await supabase.functions.invoke('owner-announcement', {
      body: { title, body, data, targetUsers },
    })
    if (error) throw error
    return result
  },

  async toggleNotificationLike(notificationId: string, action: 'like' | 'unlike') {
    const { data: result, error } = await supabase.functions.invoke('notification-like', {
      body: { notificationId, action },
    })
    if (error) throw error
    return result as { success: boolean; liked: boolean; likesCount: number }
  },

  async getTrendingPlaces() {
    const { data, error } = await supabase.functions.invoke('trending-places')
    if (error) throw error
    return data as any[]
  },
}
