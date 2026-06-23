import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Send, RotateCcw, MapPin, Sun, Cloud, Sparkles,
  CloudRain, Thermometer, ChevronRight, Play, X, Star, Navigation, Clock, CalendarDays,
  Globe, Instagram, Facebook, MessageCircle, Music2, Phone,
} from 'lucide-react'
import LubiMascot, { type LubiExpression } from '@presentation/components/features/chatbot/LubiMascot'
import { useChat } from '@presentation/hooks/chat/useChat'
import { useAuth } from '@presentation/context'
import { useSmartBack } from '@presentation/hooks/useSmartBack'
import type { VideoEmbed, PlaceCard, EventCard, WebResult } from '@lib/supabase/services/ai/chatService'

// ── "Publicado hace X" ──────────────────────────────────────────────────────────
function timeAgo(iso: string | null): string | null {
  if (!iso) return null
  const then = new Date(iso).getTime()
  if (isNaN(then)) return null
  const days = Math.floor((Date.now() - then) / 86_400_000)
  if (days <= 0)  return 'publicado hoy'
  if (days === 1) return 'publicado ayer'
  if (days < 7)   return `publicado hace ${days} días`
  if (days < 30)  return `publicado hace ${Math.floor(days / 7)} sem`
  if (days < 365) return `publicado hace ${Math.floor(days / 30)} meses`
  return `publicado hace ${Math.floor(days / 365)} año(s)`
}

// ── Weather icon ───────────────────────────────────────────────────────────────
function WeatherIcon({ bucket }: { bucket?: string }) {
  const cls = 'w-3.5 h-3.5'
  if (bucket === 'rainy') return <CloudRain className={cls} />
  if (bucket === 'cloudy') return <Cloud className={cls} />
  if (bucket === 'cold') return <Thermometer className={cls} />
  return <Sun className={cls} />
}

// ── Typing dots ────────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex gap-1.5 items-center h-5">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-2 h-2 rounded-full bg-feed-bg/20"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </div>
  )
}

// ── Message text renderer (bold + links) ───────────────────────────────────────
function AssistantMessage({ text }: { text: string }) {
  const lines = text.split('\n').filter(l => l.trim())
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const isBullet = /^[•\-*›]/.test(line.trimStart())
        const clean = isBullet ? line.replace(/^[•\-*›]\s*/, '') : line
        const rendered = renderInline(clean)
        if (isBullet) return (
          <div key={i} className="flex gap-2 items-start">
            <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-primary-400 shrink-0" />
            <p className="text-[14px] text-text-primary leading-relaxed">{rendered}</p>
          </div>
        )
        return <p key={i} className="text-[14px] text-text-primary leading-relaxed">{rendered}</p>
      })}
    </div>
  )
}

function renderInline(text: string): React.ReactNode[] {
  // Detecta **bold**, [text](url) y https:// links sueltos
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\)|https?:\/\/\S+)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    }
    const mdLink = part.match(/^\[(.*?)\]\((https?:\/\/.*?)\)$/)
    if (mdLink) {
      return (
        <a key={i} href={mdLink[2]} target="_blank" rel="noopener noreferrer"
          className="text-violet-600 underline underline-offset-2 hover:text-primary-500 font-medium">
          {mdLink[1]}
        </a>
      )
    }
    if (part.startsWith('http')) {
      const isGoogleMaps = part.includes('google.com/maps')
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 underline underline-offset-2 font-medium ${
            isGoogleMaps ? 'text-emerald-600 hover:text-emerald-700' : 'text-violet-600 hover:text-primary-500'
          }`}>
          {isGoogleMaps ? <><Navigation className="w-3 h-3" />Ver en Maps</> : part.slice(0, 40) + (part.length > 40 ? '…' : '')}
        </a>
      )
    }
    return <span key={i}>{part}</span>
  })
}

// ── Place card (foto + galería + cómo llegar + maps + publicado) ─────────────────
function PlaceCardComponent({ place }: { place: PlaceCard }) {
  const photos = [place.image, ...(place.gallery ?? [])].filter(Boolean) as string[]
  const published = timeAgo(place.publishedAt)

  return (
    <div className="rounded-2xl border border-white/10 bg-feed-bg overflow-hidden shadow-sm">
      {/* Galería de fotos */}
      {photos.length > 0 ? (
        <div className={`grid gap-0.5 ${photos.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {photos.slice(0, photos.length === 1 ? 1 : 3).map((src, i) => (
            <div key={i} className={`relative bg-feed-bg/5 overflow-hidden ${photos.length === 1 ? 'h-36' : 'h-24'}`}>
              <img src={src} alt={place.name} className="w-full h-full object-cover" loading="lazy" />
              {i === 2 && photos.length > 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-semibold">
                  +{photos.length - 3}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="h-28 bg-gradient-to-br from-primary-900/50 to-white/5 flex items-center justify-center">
          <MapPin className="w-7 h-7 text-text-muted" />
        </div>
      )}

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[14px] font-bold text-text-primary leading-tight truncate">{place.name}</p>
            <p className="text-[11px] text-text-secondary mt-0.5">{place.category}</p>
          </div>
          {place.rating != null && (
            <span className="shrink-0 flex items-center gap-0.5 text-[12px] text-primary-400 font-bold bg-primary-500/20 px-1.5 py-0.5 rounded-lg">
              <Star className="w-3 h-3 fill-primary-400 text-primary-400" />
              {Number(place.rating).toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex items-start gap-1 mt-1.5">
          <MapPin className="w-3 h-3 text-text-secondary mt-0.5 shrink-0" />
          <p className="text-[11px] text-text-secondary leading-snug">{place.address}</p>
        </div>

        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-text-secondary">
          {place.distance != null && (
            <span className="flex items-center gap-1"><Navigation className="w-3 h-3" />{place.distance.toFixed(1)} km</span>
          )}
          {published && (
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{published}</span>
          )}
        </div>

        {/* Horarios — solo si el lugar los tiene */}
        {place.hours && (
          <div className="flex items-start gap-1 mt-1.5 text-[11px] text-text-secondary">
            <Clock className="w-3 h-3 text-text-secondary mt-0.5 shrink-0" />
            <span className="leading-snug">{place.hours}</span>
          </div>
        )}

        {/* Contacto — cada chip aparece solo si existe */}
        {(place.whatsapp || place.phone || place.website) && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {place.whatsapp && (
              <a href={place.whatsapp} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-emerald-600 bg-emerald-50 hover:opacity-80 transition-opacity">
                <MessageCircle className="w-3 h-3" /> Pedidos
              </a>
            )}
            {place.phone && (
              <a href={`tel:${place.phone}`}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-sky-600 bg-sky-50 hover:opacity-80 transition-opacity">
                <Phone className="w-3 h-3" /> Llamar
              </a>
            )}
            {place.website && (
              <a href={place.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-violet-600 bg-primary-500/20 hover:opacity-80 transition-opacity">
                <Globe className="w-3 h-3" /> Web
              </a>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 mt-3">
          <a href={place.directionsUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-violet-600 text-white text-[12px] font-semibold hover:bg-violet-700 active:scale-[0.98] transition-all">
            <Navigation className="w-3.5 h-3.5" /> Cómo llegar
          </a>
          <a href={place.mapsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-text-secondary text-[12px] font-semibold hover:bg-feed-bg/5 active:scale-[0.98] transition-all">
            <MapPin className="w-3.5 h-3.5" /> Maps
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Event card ───────────────────────────────────────────────────────────────────
function EventCardComponent({ event }: { event: EventCard }) {
  const dateLabel = (() => {
    try {
      const d = new Date(event.date + 'T00:00:00')
      return d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })
    } catch { return event.date }
  })()
  return (
    <a href={event.mapsUrl} target="_blank" rel="noopener noreferrer"
      className="flex gap-3 p-3 rounded-2xl border border-white/10 bg-feed-bg hover:border-pink-300 transition-all group active:scale-[0.98] shadow-sm">
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-feed-bg/5">
        {event.image
          ? <img src={event.image} alt={event.name} className="w-full h-full object-cover" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center"><CalendarDays className="w-5 h-5 text-text-muted" /></div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-text-primary leading-tight truncate group-hover:text-pink-600 transition-colors">{event.name}</p>
        <p className="text-[11px] text-text-secondary mt-0.5">{event.category}</p>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-text-secondary">
          <span className="flex items-center gap-1 text-pink-600 font-semibold"><CalendarDays className="w-3 h-3" />{dateLabel}</span>
          {event.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.time}</span>}
        </div>
        <p className="text-[11px] text-text-secondary mt-0.5 truncate">{event.address}</p>
      </div>
    </a>
  )
}

// ── Web result card (negocio encontrado en la web) ───────────────────────────────
const SOCIAL_META: Record<string, { icon: any; color: string; label: string }> = {
  instagram: { icon: Instagram,     color: 'text-pink-600 bg-pink-50',     label: 'Instagram' },
  facebook:  { icon: Facebook,      color: 'text-blue-600 bg-blue-50',     label: 'Facebook' },
  tiktok:    { icon: Music2,        color: 'text-text-primary bg-feed-bg/5',  label: 'TikTok' },
  whatsapp:  { icon: MessageCircle, color: 'text-emerald-600 bg-emerald-50', label: 'WhatsApp' },
  web:       { icon: Globe,         color: 'text-violet-600 bg-primary-500/20', label: 'Sitio web' },
}

function WebResultCard({ result }: { result: WebResult }) {
  const published = timeAgo(result.lastActivity) ?? result.lastActivity
  return (
    <div className="rounded-2xl border border-primary-500/20 bg-primary-500/10 overflow-hidden shadow-sm">
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Globe className="w-3 h-3 text-primary-400" />
          <span className="text-[10px] font-bold text-primary-400 uppercase tracking-wider">Desde la web</span>
        </div>

        <p className="text-[14px] font-bold text-text-primary leading-tight">{result.name}</p>
        {result.offering && <p className="text-[12px] text-text-secondary mt-1 leading-snug">{result.offering}</p>}

        {result.address && (
          <div className="flex items-start gap-1 mt-1.5">
            <MapPin className="w-3 h-3 text-text-secondary mt-0.5 shrink-0" />
            <p className="text-[11px] text-text-secondary leading-snug">{result.address}</p>
          </div>
        )}

        {published && (
          <div className="flex items-center gap-1 mt-1 text-[11px] text-text-secondary">
            <Clock className="w-3 h-3" />{published}
          </div>
        )}

        {/* Redes sociales */}
        {result.socials.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {result.socials.map((s, i) => {
              const meta = SOCIAL_META[s.type] ?? SOCIAL_META.web
              const Icon = meta.icon
              return (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold ${meta.color} hover:opacity-80 transition-opacity`}>
                  <Icon className="w-3 h-3" /> {meta.label}
                </a>
              )
            })}
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2 mt-3">
          {result.mapsUrl && (
            <a href={result.mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary-600 text-white text-[12px] font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all">
              <Navigation className="w-3.5 h-3.5" /> Cómo llegar
            </a>
          )}
          {result.sourceUrl && (
            <a href={result.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-text-secondary text-[12px] font-semibold hover:bg-white/5 active:scale-[0.98] transition-all">
              <Globe className="w-3.5 h-3.5" /> Ver más
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Video embeds ───────────────────────────────────────────────────────────────
const VIDEO_META = {
  tiktok:    { label: 'TikTok',    bg: 'bg-black',                                     symbol: '♪' },
  instagram: { label: 'Instagram', bg: 'bg-gradient-to-br from-purple-500 to-pink-500', symbol: '◈' },
  youtube:   { label: 'YouTube',   bg: 'bg-red-600',                                   symbol: '▶' },
}

function VideoPreviewCard({ video, onPlay }: { video: VideoEmbed; onPlay: () => void }) {
  const m = VIDEO_META[video.platform]
  return (
    <button onClick={onPlay}
      className="mt-2 w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-white/10 bg-feed-bg hover:bg-primary-500/20 hover:border-primary-500/40 transition-all text-left active:scale-[0.98] shadow-sm group">
      <div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center text-white text-lg font-bold shrink-0`}>{m.symbol}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">{m.label}</p>
        <p className="text-[13px] text-text-secondary group-hover:text-primary-500">Toca para ver el video</p>
      </div>
      <div className="w-8 h-8 rounded-lg bg-primary-500/30 group-hover:bg-primary-500/40 flex items-center justify-center text-violet-600 shrink-0 transition-colors">
        <Play className="w-4 h-4 ml-0.5" />
      </div>
    </button>
  )
}

function VideoModal({ video, onClose }: { video: VideoEmbed; onClose: () => void }) {
  const m = VIDEO_META[video.platform]
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col bg-black/96" onClick={onClose}>
      <div className="flex items-center justify-between px-5 py-4 shrink-0" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md ${m.bg} flex items-center justify-center text-white text-xs font-bold`}>{m.symbol}</div>
          <span className="text-white text-[15px] font-semibold">{m.label}</span>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-4" onClick={e => e.stopPropagation()}>
        {video.platform === 'instagram' ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            <iframe src={video.embedUrl}
              className="w-full rounded-2xl bg-feed-bg"
              style={{ height: '60dvh', maxHeight: 600 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              loading="eager" title="Instagram" />
            <a href={video.embedUrl.replace('/embed/', '/')} target="_blank" rel="noopener noreferrer"
              className="text-white/50 text-[13px] underline hover:text-white transition-colors">
              Abrir en Instagram →
            </a>
          </div>
        ) : (
          <iframe src={video.embedUrl}
            className="w-full max-w-lg rounded-2xl"
            style={{ height: '70dvh', maxHeight: 640 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="eager" title="TikTok" />
        )}
      </div>
      <p className="text-center text-white/30 text-[12px] pb-6 shrink-0">Toca fuera para cerrar</p>
    </motion.div>
  )
}

// ── Idea skeleton ──────────────────────────────────────────────────────────────
function IdeaSkeleton() {
  return (
    <div className="w-full grid grid-cols-2 gap-2 mt-5">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-16 rounded-xl bg-feed-bg/5 animate-pulse" />
      ))}
    </div>
  )
}

// ── Main ChatPage ──────────────────────────────────────────────────────────────
const ChatPage: React.FC = () => {
  const { user } = useAuth()
  const goBack   = useSmartBack('/')
  const { messages, ideas, ideasLoading, chatLoading, city, weather, timeLabel, sendMessage, reset } = useChat(true)
  const [input,       setInput]       = useState('')
  const [activeVideo, setActiveVideo] = useState<VideoEmbed | null>(null)
  const [lubiExp,     setLubiExp]     = useState<LubiExpression>('idle')
  const messagesEndRef  = useRef<HTMLDivElement>(null)
  const inputRef        = useRef<HTMLTextAreaElement>(null)
  const lubiTimer       = useRef<ReturnType<typeof setTimeout>>()
  const hasConversation = messages.length > 0

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, chatLoading])
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 200) }, [])

  /* Expresiones de Lubi según el flujo del chat */
  useEffect(() => {
    clearTimeout(lubiTimer.current)
    if (chatLoading) {
      // Después de 450ms muestra "thinking" (así el happy del envío se ve un momento)
      lubiTimer.current = setTimeout(() => setLubiExp('thinking'), 450)
    } else if (messages.length > 0) {
      // Lubi terminó de responder → feliz
      setLubiExp('happy')
      lubiTimer.current = setTimeout(() => setLubiExp('idle'), 1800)
    }
    return () => clearTimeout(lubiTimer.current)
  }, [chatLoading])   // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const msg = input.trim()
    if (!msg || chatLoading) return
    setInput('')
    if (inputRef.current) inputRef.current.style.height = 'auto'
    // Reacción inmediata al envío del usuario
    clearTimeout(lubiTimer.current)
    setLubiExp('happy')
    await sendMessage(msg)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  useEffect(() => { if (!input && inputRef.current) inputRef.current.style.height = 'auto' }, [input])

  const openVideo  = useCallback((v: VideoEmbed) => setActiveVideo(v), [])
  const closeVideo = useCallback(() => setActiveVideo(null), [])

  const firstName = user?.name?.split(' ')[0]
  const greeting  = firstName ? `Hola, ${firstName} 👋` : 'Hola 👋'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-feed-bg">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-feed-bg border-b border-white/5 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={goBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:bg-feed-bg/5 transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative shrink-0">
            <LubiMascot size={36} variant="chat" expression={lubiExp} />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-feed-bg" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-white leading-tight">Lubi</p>
            <div className="flex items-center gap-2 mt-0.5">
              <MapPin className="w-3 h-3 text-text-secondary shrink-0" />
              <span className="text-[12px] text-text-secondary truncate">{city}</span>
              {weather && (
                <span className="flex items-center gap-1 text-[12px] text-text-secondary shrink-0">
                  <WeatherIcon bucket={weather.bucket} />
                  {weather.temp}°C
                </span>
              )}
            </div>
          </div>

          {hasConversation && (
            <button onClick={reset} title="Nueva conversación"
              className="w-9 h-9 rounded-xl text-text-secondary hover:text-text-secondary hover:bg-feed-bg/5 flex items-center justify-center transition-colors shrink-0">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Mensajes ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-2xl mx-auto px-4 py-6">

          {!hasConversation ? (
            /* Pantalla inicial */
            <div className="flex flex-col items-center">
              <div className="mb-2">
                <LubiMascot size={72} variant="chat" expression={lubiExp} />
              </div>
              <h2 className="text-[22px] font-bold text-white">{greeting}</h2>
              <p className="text-[15px] text-text-secondary mt-2 text-center max-w-xs leading-relaxed">
                {timeLabel ? `Buenas ${timeLabel}. ` : ''}¿Qué plan buscas para hoy?
              </p>

              <div className="w-full mt-8">
                {ideasLoading ? (
                  <div className="flex flex-col items-center py-10">
                    <motion.div
                      className="mb-2"
                      animate={{ scale: [1, 1.07, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <LubiMascot size={56} variant="chat" expression={lubiExp} />
                    </motion.div>
                    <p className="text-[14px] text-text-secondary font-medium">Lubi está cargando...</p>
                  </div>
                ) : (
                  <>
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                  <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Ideas para ti</span>
                </div>
                {ideas.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {ideas.map((idea, i) => (
                      <motion.button key={i}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        onClick={() => { setInput(idea.text); inputRef.current?.focus() }}
                        className="flex items-center gap-2.5 p-4 rounded-xl border border-white/10 bg-feed-bg hover:border-primary-500/40 hover:bg-primary-500/20 transition-all text-left group active:scale-[0.97] shadow-sm">
                        <span className="text-2xl leading-none shrink-0">{idea.emoji}</span>
                        <span className="text-[13px] font-medium text-text-secondary group-hover:text-primary-500 leading-tight line-clamp-2">
                          {idea.text}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                ) : null}
                  </>
                )}
              </div>

              <p className="mt-8 text-[12px] text-text-muted text-center">Escribe tu pregunta o elige una idea arriba</p>
            </div>

          ) : (
            /* Conversación */
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

                    {msg.role === 'assistant' && (
                      <div className="shrink-0 mt-0.5">
                        <LubiMascot size={30} variant="chat" expression={lubiExp} />
                      </div>
                    )}

                    <div className={`max-w-[84%] sm:max-w-[78%] space-y-2 ${msg.role === 'user' ? '' : ''}`}>
                      {/* Burbuja de texto */}
                      <div className={`${
                        msg.role === 'user'
                          ? 'bg-violet-600 text-white rounded-2xl rounded-br-sm px-4 py-3'
                          : 'bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3'
                      }`}>
                        {msg.role === 'user' ? (
                          <p className="text-[14px] leading-relaxed">{msg.content}</p>
                        ) : msg.streaming && !msg.content ? (
                          <TypingDots />
                        ) : (
                          <>
                            <AssistantMessage text={msg.content} />
                            {msg.streaming && (
                              <motion.span className="inline-block w-0.5 h-3.5 bg-primary-400"
                                animate={{ opacity: [1, 0] }} transition={{ duration: 0.55, repeat: Infinity }} />
                            )}
                          </>
                        )}
                      </div>

                      {/* Place cards */}
                      {!msg.streaming && msg.places && msg.places.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                          className="space-y-2">
                          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider px-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Lugares encontrados
                          </p>
                          {msg.places.map((p, pi) => <PlaceCardComponent key={pi} place={p} />)}
                        </motion.div>
                      )}

                      {/* Negocios de la web */}
                      {!msg.streaming && msg.webResults && msg.webResults.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                          className="space-y-2">
                          <p className="text-[11px] font-semibold text-primary-400 uppercase tracking-wider px-1 flex items-center gap-1">
                            <Globe className="w-3 h-3" /> También en la web
                          </p>
                          {msg.webResults.map((w, wi) => <WebResultCard key={wi} result={w} />)}
                        </motion.div>
                      )}

                      {/* Eventos */}
                      {!msg.streaming && msg.events && msg.events.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                          className="space-y-2">
                          <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider px-1 flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" /> Próximos eventos
                          </p>
                          {msg.events.map((e, ei) => <EventCardComponent key={ei} event={e} />)}
                        </motion.div>
                      )}

                      {/* Videos */}
                      {!msg.streaming && msg.videos && msg.videos.length > 0 && (
                        <div className="space-y-1">
                          {msg.videos.map((v, vi) => (
                            <VideoPreviewCard key={vi} video={v} onPlay={() => openVideo(v)} />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* ── Ideas como chips (conversación activa) ─────────────────────────── */}
      <AnimatePresence>
        {hasConversation && ideas.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="shrink-0 bg-feed-bg border-t border-white/5 px-4 py-2">
            <div className="max-w-2xl mx-auto flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {ideas.map((idea, i) => (
                <button key={i} onClick={() => { setInput(idea.text); inputRef.current?.focus() }}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[12px] text-text-secondary hover:bg-primary-500/20 hover:border-primary-500/30 hover:text-primary-400 transition-colors whitespace-nowrap">
                  <span>{idea.emoji}</span>
                  <span>{idea.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Indicador de carga IA ────────────────────────────────────────────── */}
      <AnimatePresence>
        {chatLoading && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="shrink-0 px-4 py-2 bg-feed-bg border-t border-white/5">
            <div className="max-w-2xl mx-auto flex items-center gap-2">
              <TypingDots />
              <span className="text-[12px] text-text-secondary">Lubi está pensando...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input ───────────────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-feed-bg border-t border-white/5 px-4 pt-3 pb-safe-4">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="flex items-end gap-3 rounded-2xl px-4 py-3 transition-all">
              <textarea ref={inputRef} value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
                placeholder={hasConversation ? 'Escribe algo más...' : '¿Qué plan buscas hoy?'}
                rows={1} maxLength={300}
                className="flex-1 resize-none bg-transparent border-0 text-[14px] text-text-primary placeholder-text-muted focus:outline-none focus:ring-0 min-h-[24px] max-h-[120px] leading-6 overflow-hidden" />
              <button type="submit" disabled={!input.trim() || chatLoading}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all bg-violet-600 text-white hover:bg-violet-700 active:scale-95 disabled:bg-white/10 disabled:text-text-secondary disabled:scale-100 disabled:cursor-not-allowed">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between items-center mt-2 px-1">
              <span className="text-[11px] text-text-muted">Enter para enviar · Shift+Enter para nueva línea</span>
              <span className="text-[11px] text-text-muted">{input.length}/300</span>
            </div>
          </form>
          <p className="text-[10px] text-text-muted text-center mt-2 leading-relaxed">
            Lubi puede cometer errores. Verifica la información importante.
          </p>
        </div>
      </div>

      {/* ── Video modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeVideo && <VideoModal video={activeVideo} onClose={closeVideo} />}
      </AnimatePresence>
    </div>
  )
}

export default ChatPage
