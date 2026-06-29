import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LubiMascot from './LubiMascot'

const MESSAGES = [
  '¡Hola! ¿Qué buscas? 😊',
  '¿Buscas un lugar? 🗺️',
  '¡Pregúntame algo! ✨',
  '¿Comida, salidas, planes? 🍕',
  '¡Soy tu guía local! 📍',
  '¿Qué plan tienes hoy? 🎉',
  '¡Conozco todos los lugares! 🌟',
]

interface ChatButtonProps {
  isVisible: boolean
  onClick?: () => void
}

const POS_KEY = 'lgz_chat_pos'
const DIZZY_THRESHOLD = 400

function loadPosition() {
  try {
    const saved = localStorage.getItem(POS_KEY)
    return saved ? JSON.parse(saved) : { x: 0, y: 0 }
  } catch {
    return { x: 0, y: 0 }
  }
}

const ChatButton: React.FC<ChatButtonProps> = ({ isVisible, onClick }) => {
  const navigate = useNavigate()
  const [msgIndex, setMsgIndex] = useState(0)
  const [offset, setOffset] = useState(loadPosition)
  const [dizzy, setDizzy] = useState(false)
  const totalDragRef = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex(i => (i + 1) % MESSAGES.length)
    }, 3800)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (dizzy) {
      const t = setTimeout(() => setDizzy(false), 1600)
      return () => clearTimeout(t)
    }
  }, [dizzy])

  if (!isVisible) return null

  const handleClick = () => {
    if (dizzy) return
    if (onClick) onClick()
    else navigate('/chat')
  }

  return (
    <motion.div
      className="fixed md:bottom-6 bottom-28 right-4 sm:right-6 z-30 flex flex-col items-center"
      initial={{ x: offset.x, y: offset.y }}
      animate={{ x: offset.x, y: offset.y }}
      drag
      dragMomentum={false}
      onDragStart={() => {
        totalDragRef.current = 0
      }}
      onDrag={(_, info) => {
        totalDragRef.current += Math.abs(info.delta.x) + Math.abs(info.delta.y)
        if (totalDragRef.current > DIZZY_THRESHOLD && !dizzy) {
          setDizzy(true)
        }
      }}
      onDragEnd={(_, info) => {
        const newOffset = {
          x: offset.x + info.offset.x,
          y: offset.y + info.offset.y,
        }
        setOffset(newOffset)
        try {
          localStorage.setItem(POS_KEY, JSON.stringify(newOffset))
        } catch {}
      }}
    >
      {/* ── Speech bubble — se desvanece/colapsa suavemente en mareo ── */}
      <motion.div
        className="relative overflow-hidden"
        initial={false}
        animate={{
          maxHeight: dizzy ? 0 : 80,
          opacity: dizzy ? 0 : 1,
          marginBottom: dizzy ? 0 : 12,
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="bg-white border border-pink-100 rounded-2xl px-3 py-2 shadow-md w-44 text-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={msgIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="text-pink-600 font-semibold text-[11px] sm:text-[12px] block leading-tight"
            >
              {MESSAGES[msgIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
        {/* Cola del bubble apuntando al personaje */}
        <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-0 h-0
          border-l-[7px] border-l-transparent
          border-r-[7px] border-r-transparent
          border-t-[8px] border-t-white"
        />
      </motion.div>

      {/* ── Mascot con flotación suave ── */}
      <motion.button
        aria-label="Pregúntame sobre lugares"
        onClick={handleClick}
        animate={
          dizzy
            ? {
                x: [0, -2, 3, -1, 2, -3, 1, 0],
                y: [0, 2, -1, 3, -2, 1, -3, 0],
              }
            : { x: 0, y: [0, -5, 0] }
        }
        transition={
          dizzy
            ? { duration: 0.35, repeat: 4, ease: 'easeInOut' }
            : {
                x: { duration: 0.4, ease: 'easeOut' },
                y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
              }
        }
        whileTap={dizzy ? undefined : { scale: 0.88 }}
        whileHover={dizzy ? undefined : { scale: 1.08 }}
        className="cursor-pointer focus:outline-none select-none block"
      >
        <LubiMascot size={56} animated={!dizzy} dizzy={dizzy} />
      </motion.button>
    </motion.div>
  )
}

export default ChatButton
