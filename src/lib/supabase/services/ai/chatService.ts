import { supabase } from '@lib/supabase/client'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export interface QuickIdea    { emoji: string; text: string; category: string }
export interface WeatherBrief { temp: number; desc: string; bucket: 'sunny' | 'rainy' | 'cloudy' | 'cold' | 'hot' }
export interface QuickIdeasResult { ideas: QuickIdea[]; city: string; weather: WeatherBrief; timeLabel: string }

export interface VideoEmbed { platform: 'tiktok' | 'instagram'; embedUrl: string }

export interface PlaceCard {
  name: string
  category: string
  address: string
  rating: number | null
  distance: number | null
  image: string | null
  gallery: string[]
  mapsUrl: string
  directionsUrl: string
  publishedAt: string | null
}

export interface EventCard {
  name: string
  address: string
  date: string
  time: string | null
  image: string | null
  category: string
  mapsUrl: string
}

export interface WebResultSocial { type: string; url: string }

export interface WebResult {
  name: string
  offering: string
  address: string | null
  mapsUrl: string | null
  lastActivity: string | null
  socials: WebResultSocial[]
  sourceUrl: string
}

export interface ChatMessage {
  role:        'user' | 'assistant'
  content:     string
  timestamp:   Date
  streaming?:  boolean
  places?:     PlaceCard[]
  events?:     EventCard[]
  videos?:     VideoEmbed[]
  webResults?: WebResult[]
  fromHistory?: boolean
}

export interface StreamCallbacks {
  onToken:  (token: string) => void
  onDone:   () => void
  onPlaces?:     (places: PlaceCard[]) => void
  onEvents?:     (events: EventCard[]) => void
  onVideos?:     (videos: VideoEmbed[]) => void
  onWebResults?: (results: WebResult[]) => void
}

export const chatService = {
  async getQuickIdeas(params: { lat?: number; lng?: number; city?: string; locationMode?: string }): Promise<QuickIdeasResult> {
    const { data, error } = await supabase.functions.invoke('ai-chat', { body: { action: 'quick-ideas', ...params } })
    if (error) throw error
    return data as QuickIdeasResult
  },

  async loadHistory(): Promise<ChatMessage[]> {
    const { data } = await supabase.functions.invoke('ai-chat', { body: { action: 'load-history' } }).catch(() => ({ data: null }))
    if (!data?.messages) return []
    return (data.messages as any[]).map(m => ({
      role:        m.role as 'user' | 'assistant',
      content:     m.content ?? '',
      timestamp:   new Date(m.ts ?? Date.now()),
      places:      m.places ?? undefined,
      events:      m.events ?? undefined,
      videos:      m.videos ?? undefined,
      webResults:  m.webResults ?? undefined,
      fromHistory: true,
    }))
  },

  async streamMessage(
    params: {
      message: string
      lat?: number
      lng?: number
      city?: string
      conversationHistory?: Array<{ role: string; content: string }>
      shownPlaces?: string[]
      locationMode?: 'nearby' | 'city'
    },
    cb: StreamCallbacks,
  ): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token ?? SUPABASE_ANON_KEY

    let res: Response
    try {
      res = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({
          action: 'chat',
          message: params.message,
          lat: params.lat, lng: params.lng, city: params.city,
          conversationHistory: params.conversationHistory ?? [],
          shownPlaces: params.shownPlaces ?? [],
          locationMode: params.locationMode ?? 'nearby',
        }),
      })
    } catch {
      cb.onToken('😅 Sin conexión con el asistente. Revisá tu internet e intentá de nuevo.')
      cb.onDone(); return
    }

    if (!res.ok || !res.body) { cb.onToken(`Error ${res.status}. Intentá de nuevo.`); cb.onDone(); return }

    const reader = res.body.getReader(), decoder = new TextDecoder()
    let buffer = ''
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const payload = line.slice(5).trim()
          if (payload === '[DONE]') { cb.onDone(); return }
          try {
            const json = JSON.parse(payload)
            if (json.token)  cb.onToken(json.token)
            if (json.places && cb.onPlaces) cb.onPlaces(json.places)
            if (json.events && cb.onEvents) cb.onEvents(json.events)
            if (json.videos && cb.onVideos) cb.onVideos(json.videos)
            if (json.webResults && cb.onWebResults) cb.onWebResults(json.webResults)
          } catch { /* fragmento parcial */ }
        }
      }
    } catch { /* stream cortado */ }
    cb.onDone()
  },
}
