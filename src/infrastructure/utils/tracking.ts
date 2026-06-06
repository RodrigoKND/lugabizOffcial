import { userActivityService } from '@lib/supabase/services/places/userActivity';

const STORAGE_PREFIX = '_lugabiz_'
const SESSION_KEY = `${STORAGE_PREFIX}s`

function getStorage(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

function setStorage(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch {}
}

let currentUserId: string | null = null
let flushTimer: ReturnType<typeof setTimeout> | null = null
const pendingActions: Array<{ action: string; data?: Record<string, unknown> }> = []

export function setTrackingUser(userId: string | null) {
  currentUserId = userId
  if (userId) {
    tracking.trackPageView()
    startAutoFlush()
  } else {
    stopAutoFlush()
  }
}

function startAutoFlush() {
  stopAutoFlush()
  flushTimer = setInterval(flushPendingActions, 30000)
}

function stopAutoFlush() {
  if (flushTimer) {
    clearInterval(flushTimer)
    flushTimer = null
  }
}

async function flushPendingActions() {
  if (!currentUserId || pendingActions.length === 0) return
  const batch = pendingActions.splice(0)
  try {
    await Promise.allSettled(
      batch.map(p => userActivityService.trackAction(currentUserId!, p.action, p.data))
    )
  } catch {}
}

export const tracking = {
  isFirstVisit(): boolean {
    return !getStorage(`${STORAGE_PREFIX}t`)
  },

  markVisited() {
    setStorage(`${STORAGE_PREFIX}t`, '1')
  },

  getSessionId(): string {
    let sessionId = sessionStorage.getItem(SESSION_KEY)
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem(SESSION_KEY, sessionId)
    }
    return sessionId
  },

  async trackAction(action: string, data?: Record<string, unknown>) {
    try {
      pendingActions.push({ action, data })

      if (pendingActions.length >= 10) {
        await flushPendingActions()
      }
    } catch {}
  },

  trackPageView(page?: string) {
    const path = page || window.location.pathname
    // Throttle: avoid duplicate page_view within 30 s for the same path (session-only, not persisted)
    const key = `_lbpv_${path}`
    const last = sessionStorage.getItem(key)
    const now = Date.now()
    if (last && now - parseInt(last, 10) < 30000) return
    sessionStorage.setItem(key, String(now))
    // Save to DB via user_activity (persistent record of user navigation)
    this.trackAction('page_view', { path })
  },

  isNewUserRegistration(): boolean {
    return !getStorage(`${STORAGE_PREFIX}registered`)
  },

  markRegistered() {
    setStorage(`${STORAGE_PREFIX}registered`, '1')
  },
}

window.addEventListener('popstate', () => {
  if (currentUserId) tracking.trackPageView()
})
