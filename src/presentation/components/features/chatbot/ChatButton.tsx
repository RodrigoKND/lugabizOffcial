import { useState, useEffect } from 'react'
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

const ChatButton: React.FC<ChatButtonProps> = ({ isVisible, onClick }) => {
  const navigate = useNavigate()
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex(i => (i + 1) % MESSAGES.length)
    }, 3800)
    return () => clearInterval(id)
  }, [])

  if (!isVisible) return null

  const handleClick = () => {
    if (onClick) onClick()
    else navigate('/chat')
  }

  return (
    <div className="fixed md:bottom-6 bottom-28 right-4 sm:right-6 z-40 flex flex-col items-center">

      {/* ── Speech bubble — ancho fijo para que la cola no se mueva ── */}
      <div className="mb-3 relative">
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
      </div>

      {/* ── Mascot con flotación suave ── */}
      <motion.button
        aria-label="Pregúntame sobre lugares"
        onClick={handleClick}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.08 }}
        className="cursor-pointer focus:outline-none select-none block"
      >
        <LubiMascot size={56} animated />
      </motion.button>
    </div>
  )
}

export default ChatButton
