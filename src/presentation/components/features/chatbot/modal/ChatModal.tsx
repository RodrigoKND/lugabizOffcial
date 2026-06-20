import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Compass, Sparkles, RotateCcw, MapPin, Sun, Cloud, CloudRain, Thermometer, ChevronRight, Play } from 'lucide-react'
import { useChat } from '@presentation/hooks/chat/useChat'
import { useAuth } from '@presentation/context'
import type { VideoEmbed } from '@lib/supabase/services/ai/chatService'

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
}

function WeatherIcon({ bucket }: { bucket?: string }) {
  const cls = 'w-3.5 h-3.5'
  if (bucket === 'rainy') return <CloudRain className={cls} />
  if (bucket === 'cloudy') return <Cloud className={cls} />
  if (bucket === 'cold') return <Thermometer className={cls} />
  return <Sun className={cls} />
}

function AssistantMessage({ text }: { text: string }) {
  const lines = text.split('\n').filter((l) => l.trim())
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const isBullet = /^[•\-*›]/.test(line.trimStart())
        const clean = isBullet ? line.replace(/^[•\-*›]\s*/, '') : line
        const formatted = clean.split(/(\*\*.*?\*\*)/g).map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>
            : <span key={j}>{part}</span>
        )
        if (isBullet) return (
          <div key={i} className="flex gap-2 items-start">
            <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-violet-400 shrink-0" />
            <p className="text-[14px] text-slate-700 leading-relaxed">{formatted}</p>
          </div>
        )
        return <p key={i} className="text-[14px] text-slate-700 leading-relaxed">{formatted}</p>
      })}
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex gap-1.5 items-center h-5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-slate-300"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  )
}

const VIDEO_META = {
  tiktok:    { label: 'TikTok',    bg: 'bg-black',                                          symbol: '♪' },
  instagram: { label: 'Instagram', bg: 'bg-gradient-to-br from-purple-500 to-pink-500',      symbol: '◈' },
  youtube:   { label: 'YouTube',   bg: 'bg-red-600',                                         symbol: '▶' },
}

function VideoPreviewCard({ video, onPlay }: { video: VideoEmbed; onPlay: () => void }) {
  const m = VIDEO_META[video.platform]
  return (
    <button
      onClick={onPlay}
      className="mt-2 w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-200 bg-white hover:bg-violet-50 hover:border-violet-300 transition-all text-left active:scale-[0.98] shadow-sm group"
    >
      <div className={`w-9 h-9 rounded-lg ${m.bg} flex items-center justify-center text-white text-base font-bold shrink-0`}>
        {m.symbol}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{m.label}</p>
        <p className="text-[13px] text-slate-600 group-hover:text-violet-700">Toca para ver el video</p>
      </div>
      <div className="w-7 h-7 rounded-lg bg-violet-100 group-hover:bg-violet-200 flex items-center justify-center text-violet-600 shrink-0 transition-colors">
        <Play className="w-3.5 h-3.5 ml-0.5" />
      </div>
    </button>
  )
}

function VideoModal({ video, onClose }: { video: VideoEmbed; onClose: () => void }) {
  const m = VIDEO_META[video.platform]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex flex-col bg-black/96"
      onClick={onClose}
    >
      <div
        className="flex items-center justify-between px-5 py-4 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-md ${m.bg} flex items-center justify-center text-white text-xs font-bold`}>
            {m.symbol}
          </div>
          <span className="text-white text-[15px] font-semibold">{m.label}</span>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div
        className="flex-1 flex items-center justify-center px-4 pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={video.embedUrl}
          className="w-full max-w-lg rounded-2xl"
          style={{ height: video.platform === 'tiktok' ? '70dvh' : '55dvh', maxHeight: 640 }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          loading="eager"
          title={`${m.label} video`}
        />
      </div>
      <p className="text-center text-white/30 text-[12px] pb-6 shrink-0">Toca fuera para cerrar</p>
    </motion.div>
  )
}

function IdeaSkeleton() {
  return (
    <div className="w-full grid grid-cols-2 gap-2 mt-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
      ))}
    </div>
  )
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const { messages, ideas, ideasLoading, chatLoading, city, weather, timeLabel, sendMessage, reset } = useChat(isOpen)
  const [input, setInput] = useState('')
  const [activeVideo, setActiveVideo] = useState<VideoEmbed | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const hasConversation = messages.length > 0
  const openVideo = useCallback((v: VideoEmbed) => setActiveVideo(v), [])
  const closeVideo = useCallback(() => setActiveVideo(null), [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatLoading])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 350)
  }, [isOpen])

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const msg = input.trim()
    if (!msg || chatLoading) return
    setInput('')
    await sendMessage(msg)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  const firstName = user?.name?.split(' ')[0]
  const greeting = firstName ? `Hola, ${firstName}` : 'Hola'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[190] bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2
                       left-0 right-0
                       sm:left-1/2 sm:-translate-x-1/2
                       sm:w-[900px]
                       z-[200] flex flex-col"
            style={{ maxHeight: '92dvh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden h-full sm:max-h-[760px] border border-slate-100">

              {/* ── Header ──────────────────────────────────────── */}
              <div className="px-5 py-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar con indicador online */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm shadow-violet-200">
                        <Compass className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                    </div>

                    <div>
                      <p className="text-[15px] font-semibold text-slate-900 leading-tight">Lubi</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="text-[12px] text-slate-400">{city}</span>
                        {weather && (
                          <span className="flex items-center gap-1 text-[12px] text-slate-400">
                            <WeatherIcon bucket={weather.bucket} />
                            {weather.temp}°C
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {hasConversation && (
                      <button
                        onClick={reset}
                        title="Nueva conversación"
                        className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Área de mensajes ─────────────────────────────── */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 min-h-0">

                {!hasConversation ? (
                  /* Estado inicial */
                  <div className="flex flex-col items-center">

                    <h3 className="text-[18px] font-semibold text-slate-900">{greeting} 👋</h3>
                    <p className="text-[14px] text-slate-400 mt-1 text-center max-w-[260px] leading-relaxed">
                      {timeLabel ? `Buenas ${timeLabel}. ` : ''}¿Qué plan buscas para hoy?
                    </p>

                    {/* Ideas rápidas en grid */}
                    <div className="w-full mt-6">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Ideas para ti
                        </span>
                      </div>

                      {ideasLoading ? (
                        <IdeaSkeleton />
                      ) : ideas.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {ideas.map((idea, i) => (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.06 }}
                              onClick={() => { setInput(idea.text); inputRef.current?.focus() }}
                              className="flex items-center gap-2.5 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50 transition-all text-left group active:scale-[0.98]"
                            >
                              <span className="text-xl leading-none shrink-0">{idea.emoji}</span>
                              <span className="text-[13px] font-medium text-slate-600 group-hover:text-violet-700 leading-tight line-clamp-2">
                                {idea.text}
                              </span>
                            </motion.button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  /* Conversación */
                  <div className="space-y-5">
                    <AnimatePresence initial={false}>
                      {messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.18 }}
                          className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {/* Avatar asistente */}
                          {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-violet-200">
                              <Compass className="w-4 h-4 text-white" />
                            </div>
                          )}

                          {/* Burbuja */}
                          <div className={`max-w-[80%] ${
                            msg.role === 'user'
                              ? 'bg-violet-600 text-white rounded-2xl rounded-br-sm px-4 py-3'
                              : 'bg-slate-50 border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3'
                          }`}>
                            {msg.role === 'user' ? (
                              <p className="text-[14px] leading-relaxed">{msg.content}</p>
                            ) : msg.streaming && !msg.content ? (
                              <TypingDots />
                            ) : (
                              <>
                                <AssistantMessage text={msg.content} />
                                {msg.streaming && (
                                  <motion.span
                                    className="inline-block w-0.5 h-3.5 bg-violet-400 rounded-full ml-0.5 align-middle"
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ duration: 0.55, repeat: Infinity }}
                                  />
                                )}
                                {!msg.streaming && msg.videos && msg.videos.length > 0 && (
                                  <div className="mt-1 space-y-1">
                                    {msg.videos.map((v, vi) => (
                                      <VideoPreviewCard key={vi} video={v} onPlay={() => openVideo(v)} />
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* ── Ideas como chips cuando hay conversación ──────── */}
              {hasConversation && ideas.length > 0 && (
                <div className="px-5 pb-2 shrink-0">
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {ideas.map((idea, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(idea.text); inputRef.current?.focus() }}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[12px] text-slate-500 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-600 transition-colors whitespace-nowrap"
                      >
                        <span>{idea.emoji}</span>
                        <span>{idea.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Input ────────────────────────────────────────── */}
<div className="px-5 pt-2 pb-5 border-t border-slate-100 shrink-0">
  <form onSubmit={handleSubmit}>
    <div
      className="
        flex items-end gap-3
        rounded-2xl
        p-4
        transition-all
        w-full
      "
    >
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          hasConversation
            ? 'Escribe algo más...'
            : '¿Qué plan buscas hoy?'
        }
        rows={1}
        maxLength={250}
        className="
          flex-1
          min-w-0
          w-full
          resize-none
          bg-transparent
          text-[14px]
          text-slate-800
          placeholder-slate-400
          focus:outline-none
          leading-6
          whitespace-pre-wrap
          break-words
          overflow-y-auto
        "
        style={{
          minHeight: '40px',
          maxHeight: '96px'
        }}
      />

      <button
        type="submit"
        disabled={!input.trim() || chatLoading}
        className="
          w-9 h-9
          rounded-xl
          flex items-center justify-center
          shrink-0
          transition-all
          bg-violet-600
          text-white
          hover:bg-violet-700
          active:scale-95
          disabled:bg-slate-200
          disabled:text-slate-400
          disabled:scale-100
          disabled:cursor-not-allowed
        "
      >
        <Send className="w-4 h-4" />
      </button>
    </div>

    <div className="flex justify-between items-center mt-2 px-1">
      <span className="text-[11px] text-slate-300">
        Lubi puede cometer errores, revisa antes de ir a un lugar
      </span>

      <span className="text-[11px] text-slate-300">
        {input.length}/250
      </span>
    </div>
  </form>
</div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Video modal fullscreen sobre todo */}
    <AnimatePresence>
      {activeVideo && (
        <VideoModal video={activeVideo} onClose={closeVideo} />
      )}
    </AnimatePresence>
  )
}

export default ChatModal
