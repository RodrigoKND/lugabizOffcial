import { useState, useCallback, useRef, useEffect } from 'react'
import {
  chatService, ChatMessage, QuickIdea, WeatherBrief,
  VideoEmbed, PlaceCard, EventCard, WebResult,
} from '@lib/supabase/services/ai/chatService'
import { useAuth } from '@presentation/context'

export function useChat(isOpen: boolean) {
  const { user } = useAuth()

  const [messages,     setMessages]     = useState<ChatMessage[]>([])
  const [ideas,        setIdeas]        = useState<QuickIdea[]>([])
  const [ideasLoading, setIdeasLoading] = useState(true)
  const [chatLoading,  setChatLoading]  = useState(false)
  const [city,         setCity]         = useState('tu ciudad')
  const [weather,      setWeather]      = useState<WeatherBrief | null>(null)
  const [timeLabel,    setTimeLabel]    = useState('')
  const locationMode = 'nearby'

  const coordsRef = useRef<{ lat: number; lng: number } | null>(null)
  const geoRef    = useRef<Promise<{ lat: number; lng: number } | null> | null>(null)
  const ideasDone = useRef(false)
  const msgsRef   = useRef<ChatMessage[]>([])
  useEffect(() => { msgsRef.current = messages }, [messages])

  // Helper: actualiza la última burbuja del asistente
  const patchLast = (patch: Partial<ChatMessage> | ((m: ChatMessage) => Partial<ChatMessage>)) =>
    setMessages(prev => {
      const copy = [...prev]
      const last = copy[copy.length - 1]
      if (last?.role === 'assistant') {
        const p = typeof patch === 'function' ? patch(last) : patch
        copy[copy.length - 1] = { ...last, ...p }
      }
      return copy
    })

  // ── Geolocalización en segundo plano ──────────────────────────────────────
  useEffect(() => {
    geoRef.current = (async () => {
      if (navigator.geolocation) {
        try {
          return await new Promise<{ lat: number; lng: number }>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(
              p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
              reject, { enableHighAccuracy: true, timeout: 6000 },
            )
          ).then(c => { coordsRef.current = c; return c })
        } catch {}
      }
      try {
        const r = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) })
        if (r.ok) {
          const d = await r.json()
          if (d.latitude && !d.error) { const c = { lat: +d.latitude, lng: +d.longitude }; coordsRef.current = c; return c }
        }
      } catch {}
      return null
    })()
  }, [])

  // ── Ideas rápidas ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) { setIdeasLoading(false); return }
    if (ideasDone.current) return
    ideasDone.current = true
    setIdeasLoading(true)
    ;(async () => {
      const c = await Promise.race([geoRef.current ?? Promise.resolve(null), new Promise<null>(r => setTimeout(() => r(null), 5000))])
      return chatService.getQuickIdeas({ lat: c?.lat, lng: c?.lng, locationMode })
    })()
      .then(r => {
        setIdeas(r.ideas); setCity(r.city); setWeather(r.weather); setTimeLabel(r.timeLabel)
        try { if (r.city !== 'tu ciudad') localStorage.setItem('_lugabiz_city', r.city) } catch {}
      })
      .catch(() => {})
      .finally(() => setIdeasLoading(false))
  }, [isOpen])

  // ── Enviar mensaje ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (content: string) => {
    // Últimos 6 mensajes (3 intercambios) para ahorrar tokens
    const history = msgsRef.current
      .filter(m => !m.streaming && m.content.trim())
      .slice(-6)
      .map(m => ({ role: m.role, content: m.content }))

    // Últimos lugares mencionados, sin repetir
    const shownPlaces = [...new Set(
      msgsRef.current.flatMap(m => (m.places ?? []).map(p => p.name)),
    )].slice(-8)

    setMessages(prev => [
      ...prev,
      { role: 'user',      content, timestamp: new Date() },
      { role: 'assistant', content: '', timestamp: new Date(), streaming: true },
    ])
    setChatLoading(true)

    await chatService.streamMessage(
      { message: content, lat: coordsRef.current?.lat, lng: coordsRef.current?.lng, city, conversationHistory: history, shownPlaces, locationMode },
      {
        onToken:      token   => patchLast(m => ({ content: m.content + token })),
        onDone:       ()      => { patchLast({ streaming: false }); setChatLoading(false) },
        onPlaces:     places  => patchLast({ places }),
        onEvents:     events  => patchLast({ events }),
        onVideos:     videos  => patchLast({ videos }),
        onWebResults: webResults => patchLast({ webResults }),
      },
    )
  }, [city, locationMode])

  const reset = useCallback(() => {
    setMessages([])
  }, [])

  return { messages, ideas, ideasLoading, chatLoading, city, weather, timeLabel, locationMode, sendMessage, reset }
}
