/**
 * chatService — único punto de contacto con la Edge Function ai-chat.
 * - getQuickIdeas: usa supabase.functions.invoke() (respuesta JSON normal)
 * - streamMessage: usa fetch() directo porque supabase.functions.invoke no soporta streaming
 * Las API keys (HF, Tavily) nunca llegan al browser.
 */

import { supabase } from '@lib/supabase/client'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export interface QuickIdea {
  emoji: string
  text: string
  category: string
}

export interface WeatherBrief {
  temp: number
  desc: string
  bucket: 'sunny' | 'rainy' | 'cloudy' | 'cold' | 'hot'
}

export interface QuickIdeasResult {
  ideas: QuickIdea[]
  city: string
  weather: WeatherBrief
  timeLabel: string
}

export interface VideoEmbed {
  platform: 'tiktok' | 'instagram' | 'youtube'
  embedUrl: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  streaming?: boolean
  videos?: VideoEmbed[]
}

export const chatService = {
  async getQuickIdeas(params: { lat?: number; lng?: number; city?: string }): Promise<QuickIdeasResult> {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { action: 'quick-ideas', ...params },
    })
    if (error) throw error
    return data as QuickIdeasResult
  },

  /**
   * Llama la Edge Function con streaming SSE.
   * onToken  → se llama con cada fragmento de texto que llega
   * onDone   → se llama cuando el stream termina (éxito o error)
   */
  async streamMessage(
    params: {
      message: string
      lat?: number
      lng?: number
      city?: string
      conversationHistory?: Array<{ role: string; content: string }>
    },
    onToken: (token: string) => void,
    onDone: () => void,
    onVideos?: (videos: VideoEmbed[]) => void,
  ): Promise<void> {
    // Obtenemos el JWT del usuario (o el anon key si no está autenticado)
    const { data: { session } } = await supabase.auth.getSession()
    const authToken = session?.access_token ?? SUPABASE_ANON_KEY

    let res: Response
    try {
      res = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          action: 'chat',
          message: params.message,
          lat: params.lat,
          lng: params.lng,
          city: params.city,
          conversation_history: params.conversationHistory ?? [],
        }),
      })
    } catch {
      onToken('😅 No pude conectar con el asistente. Intenta de nuevo.')
      onDone()
      return
    }

    if (!res.ok || !res.body) {
      onToken(`🤔 Error ${res.status}. Intenta de nuevo.`)
      onDone()
      return
    }

    // Leer el stream SSE
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            onDone()
            return
          }
          try {
            const json = JSON.parse(data)
            if (json.token) onToken(json.token)
            if (json.videos && onVideos) onVideos(json.videos)
          } catch { /* ignorar chunks malformados */ }
        }
      }
    } catch {
      // stream cortado
    }
    onDone()
  },
}
