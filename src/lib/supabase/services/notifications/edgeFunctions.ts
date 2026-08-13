import { pushServerFetch, pushServerGet } from '@lib/pushServer'

export const edgeService = {
  // Migrado al servidor propio de notificaciones (lugabizPushServer) — ya
  // no pasa por la Edge Function `owner-announcement`.
  async createOwnerAnnouncement(title: string, body: string, data?: Record<string, unknown>, targetUsers?: string[]) {
    return pushServerFetch<{ success: boolean; sentTo: number; pushSent: number }>(
      '/api/v1/notify/owner-announcement',
      { title, body, data, targetUsers },
    )
  },

  async toggleNotificationLike(notificationId: string, action: 'like' | 'unlike') {
    return pushServerFetch<{ success: boolean; liked: boolean; likesCount: number }>(
      '/api/v1/notifications/like',
      { notificationId, action },
    )
  },

  async getTrendingPlaces() {
    return pushServerGet<Record<string, unknown>[]>('/api/v1/places/trending')
  },

  async sendSurveyPush(surveyId: string, title: string, body: string, categoryIds: string[]) {
    return pushServerFetch<{ sent: number }>('/api/v1/notify/survey', { surveyId, title, body, categoryIds })
  },

  async sendEventStartPush(eventId: string) {
    return pushServerFetch<{ sent: number; already_sent?: boolean }>('/api/v1/notify/event/start', { eventId })
  },

  async banUserWithPush(userId: string, reason: string) {
    return pushServerFetch<{ sent: number }>('/api/v1/notify/ban-user', { userId, reason })
  },

  async sendAttendancePush(eventId: string, attendeeCount: number) {
    return pushServerFetch<{ sent: number }>('/api/v1/notify/event/attendance', { eventId, attendeeCount })
  },

  async sendFriendRequestPush(friendshipId: string) {
    return pushServerFetch<{ sent: number }>('/api/v1/notify/friendship/request', { friendshipId })
  },

  async sendFriendAcceptPush(friendshipId: string) {
    return pushServerFetch<{ sent: number }>('/api/v1/notify/friendship/accept', { friendshipId })
  },

  async sendPlanInvitePush(participantId: string) {
    return pushServerFetch<{ sent: number }>('/api/v1/notify/plan/invite', { participantId })
  },

  async sendPlanResponsePush(participantId: string) {
    return pushServerFetch<{ sent: number }>('/api/v1/notify/plan/response', { participantId })
  },
}
