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

  async sendSurveyPush(surveyId: string, title: string, body: string, categoryIds: string[]) {
    const { data: result, error } = await supabase.functions.invoke('send-survey-push', {
      body: { surveyId, title, body, categoryIds },
    })
    if (error) throw error
    return result as { sent: number }
  },

  async sendEventStartPush(eventId: string) {
    const { data: result, error } = await supabase.functions.invoke('send-event-start-push', {
      body: { eventId },
    })
    if (error) throw error
    return result as { sent: number; already_sent?: boolean }
  },

  async banUserWithPush(userId: string, reason: string) {
    const { data: result, error } = await supabase.functions.invoke('ban-user-push', {
      body: { userId, reason },
    })
    if (error) throw error
    return result as { sent: number }
  },

  async sendAttendancePush(eventId: string, attendeeCount: number) {
    const { data: result, error } = await supabase.functions.invoke('send-event-attendance-push', {
      body: { eventId, attendeeCount },
    })
    if (error) throw error
    return result as { sent: number }
  },
}
