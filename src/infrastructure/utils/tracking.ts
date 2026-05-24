const TRACKING_COOKIE = '_lugabiz_t'
const SESSION_KEY = '_lugabiz_s'

function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export const tracking = {
  isFirstVisit(): boolean {
    return !getCookie(TRACKING_COOKIE)
  },

  markVisited() {
    setCookie(TRACKING_COOKIE, '1')
  },

  getSessionId(): string {
    let sessionId = sessionStorage.getItem(SESSION_KEY)
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem(SESSION_KEY, sessionId)
    }
    return sessionId
  },

  trackAction(action: string, data?: Record<string, unknown>) {
    try {
      const payload = {
        action,
        sessionId: this.getSessionId(),
        timestamp: new Date().toISOString(),
        ...data,
      }
      sessionStorage.setItem(`_track_${action}_${Date.now()}`, JSON.stringify(payload))
    } catch {
    }
  },

  isNewUserRegistration(): boolean {
    return !getCookie('_lugabiz_registered')
  },

  markRegistered() {
    setCookie('_lugabiz_registered', '1', 365)
  },
}
