import { useState, useCallback, useRef, useEffect } from 'react'
import { chatService, ChatMessage, QuickIdea, WeatherBrief, VideoEmbed } from '@lib/supabase/services/ai/chatService'

export function useChat(isOpen: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [ideas, setIdeas] = useState<QuickIdea[]>([])
  const [ideasLoading, setIdeasLoading] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const [city, setCity] = useState('tu ciudad')
  const [weather, setWeather] = useState<WeatherBrief | null>(null)
  const [timeLabel, setTimeLabel] = useState('')

  const coordsRef = useRef<{ lat: number; lng: number } | null>(null)
  const geoPromiseRef = useRef<Promise<{ lat: number; lng: number } | null> | null>(null)
  const ideasFetched = useRef(false)

  useEffect(() => {
    // Estrategia de ubicación:
    // 1. GPS del navegador (más preciso, enableHighAccuracy)
    // 2. Si falla → ipapi.co desde el CLIENTE (usa la IP real del usuario, no la del servidor)
    // Así nunca se usa la IP del servidor de Supabase (que daba Buenos Aires)
    const resolveLocation = async (): Promise<{ lat: number; lng: number } | null> => {
      // Intento 1: GPS del dispositivo
      if (navigator.geolocation) {
        try {
          const coords = await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
              reject,
              { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 },
            )
          })
          coordsRef.current = coords
          return coords
        } catch { /* GPS denegado o timeout, intentar IP */ }
      }

      // Intento 2: geolocalización por IP del cliente (no del servidor)
      try {
        const res = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(4000),
        })
        if (res.ok) {
          const d = await res.json()
          if (d.latitude && d.longitude && !d.error) {
            const coords = { lat: Number(d.latitude), lng: Number(d.longitude) }
            coordsRef.current = coords
            return coords
          }
        }
      } catch { /* sin ubicación disponible */ }

      return null
    }

    geoPromiseRef.current = resolveLocation()
  }, [])

  useEffect(() => {
    if (!isOpen || ideasFetched.current) return
    ideasFetched.current = true
    setIdeasLoading(true)

    const fetchIdeas = async () => {
      // Espera coords GPS (máx 5s) antes de caer en IP geolocation del backend
      // El backend maneja su propio caché en ai_quick_ideas_cache (2h TTL)
      const geoTimeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
      const coords = await Promise.race([geoPromiseRef.current ?? Promise.resolve(null), geoTimeout])
      return chatService.getQuickIdeas({ lat: coords?.lat, lng: coords?.lng })
    }

    fetchIdeas()
      .then((r) => {
        setIdeas(r.ideas); setCity(r.city); setWeather(r.weather); setTimeLabel(r.timeLabel);
        if (r.city && r.city !== 'tu ciudad') {
          try { localStorage.setItem('_lugabiz_city', r.city); } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setIdeasLoading(false))
  }, [isOpen])

  const sendMessage = useCallback(
    async (content: string) => {
      // 1. Agregar mensaje del usuario
      const userMsg: ChatMessage = { role: 'user', content, timestamp: new Date() }
      setMessages((prev) => [...prev, userMsg])

      // 2. Agregar burbuja vacía de asistente (se irá llenando token a token)
      setMessages((prev) => [...prev, { role: 'assistant', content: '', timestamp: new Date(), streaming: true }])
      setChatLoading(true)

      // Historial para contexto (excluye la burbuja vacía que acabamos de añadir)
      const history = messages
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }))

      await chatService.streamMessage(
        { message: content, lat: coordsRef.current?.lat, lng: coordsRef.current?.lng, city, conversationHistory: history },
        (token) => {
          setMessages((prev) => {
            const copy = [...prev]
            const last = copy[copy.length - 1]
            if (last?.role === 'assistant') {
              copy[copy.length - 1] = { ...last, content: last.content + token }
            }
            return copy
          })
        },
        () => {
          setMessages((prev) => {
            const copy = [...prev]
            const last = copy[copy.length - 1]
            if (last?.role === 'assistant') {
              copy[copy.length - 1] = { ...last, streaming: false }
            }
            return copy
          })
          setChatLoading(false)
        },
        (videos: VideoEmbed[]) => {
          setMessages((prev) => {
            const copy = [...prev]
            const last = copy[copy.length - 1]
            if (last?.role === 'assistant') {
              copy[copy.length - 1] = { ...last, videos }
            }
            return copy
          })
        },
      )
    },
    [messages, city],
  )

  const reset = useCallback(() => setMessages([]), [])

  return { messages, ideas, ideasLoading, chatLoading, city, weather, timeLabel, sendMessage, reset }
}
