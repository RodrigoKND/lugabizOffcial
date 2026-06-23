import { motion } from 'framer-motion'

export type LubiExpression = 'idle' | 'happy' | 'thinking'

interface LubiMascotProps {
  size?: number
  animated?: boolean
  variant?: 'button' | 'chat'
  expression?: LubiExpression
  className?: string
}

/* ── Configuración de expresiones (solo para variant="chat") ─────────────
   whiteScaleY : escala vertical del ojo blanco
   pupilDY     : desplazamiento Y de la pupila (SVG px)
   pupilScale  : tamaño de la pupila
   blushOp     : opacidad del rubor
────────────────────────────────────────────────────────────────────────── */
const EXPR: Record<LubiExpression, {
  whiteScaleY: number
  pupilDY: number
  pupilScale: number
  blushOp: number
}> = {
  idle:     { whiteScaleY: 1,    pupilDY: 0,   pupilScale: 1,    blushOp: 0.18 },
  happy:    { whiteScaleY: 0.46, pupilDY: 3.5, pupilScale: 0.6,  blushOp: 0.48 },
  thinking: { whiteScaleY: 0.76, pupilDY: -2,  pupilScale: 0.9,  blushOp: 0.10 },
}
const ETRANS = { duration: 0.22, ease: 'easeOut' as const }

/* ── Parpadeo sincronizado — mismo objeto de transición para ambos ojos ── */
const BLINK_ANIM = { scaleY: [1, 0.05, 1] as number[] }
const BLINK_TRANS = {
  duration: 0.16,
  ease: 'linear' as const,
  repeat: Infinity,
  repeatDelay: 3.6,
}

/* ─────────────────────────────────────────────────────────────────────────
   CARA PARA CHATBUTTON — parpadeo animado, diseño neutro
   Pupilas simétricas: ambas apuntan levemente hacia el centro de la cara
   (izq +2px, der −2px) para efecto "mirándote" sin parecer vizco.
───────────────────────────────────────────────────────────────────────── */
function LubiButtonFace({ size, animated }: { size: number; animated: boolean }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', display: 'block' }}
      aria-hidden="true"
    >
      {/* Cuerpo */}
      <circle cx="32" cy="32" r="28" fill="#EC4899" />
      <ellipse cx="21" cy="19" rx="10" ry="6" fill="#FBCFE8" opacity="0.3" />

      {/* Ambos ojos en un solo motion.g para garantizar parpadeo sincronizado */}
      <motion.g
        animate={animated ? BLINK_ANIM : {}}
        transition={animated ? BLINK_TRANS : {}}
        style={{ transformBox: 'fill-box' }}
      >
        {/* Ojo izquierdo — centro x=20 */}
        <g style={{ transformOrigin: '20px 32px', transformBox: 'fill-box' }}>
          <ellipse cx="20" cy="32" rx="8.5" ry="9" fill="white" />
        </g>
        {/* Ojo derecho — centro x=44 */}
        <g style={{ transformOrigin: '44px 32px', transformBox: 'fill-box' }}>
          <ellipse cx="44" cy="32" rx="8.5" ry="9" fill="white" />
        </g>
      </motion.g>

      {/* Pupilas — fuera del grupo de parpadeo, se muestran sobre los ojos */}
      {/* Izq: cx=22 (+2 desde centro 20 = mirando levemente al centro) */}
      <circle cx="22" cy="33" r="5.8" fill="#1C1028" />
      {/* Der: cx=42 (−2 desde centro 44 = mirando levemente al centro, simétrico) */}
      <circle cx="42" cy="33" r="5.8" fill="#1C1028" />

      {/* Brillos — espejo perfecto */}
      <circle cx="24.5" cy="30" r="2.2" fill="white" />
      <circle cx="39.5" cy="30" r="2.2" fill="white" />

      {/* Rubor */}
      <ellipse cx="9"  cy="42" rx="7.5" ry="4.5" fill="#BE185D" opacity="0.16" />
      <ellipse cx="55" cy="42" rx="7.5" ry="4.5" fill="#BE185D" opacity="0.16" />
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   CARA PARA CHATPAGE — expresiones faciales reactivas
───────────────────────────────────────────────────────────────────────── */
function LubiChatFace({ size, expression = 'idle' }: { size: number; expression: LubiExpression }) {
  const c = EXPR[expression]
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', display: 'block' }}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="28" fill="#EC4899" />
      <ellipse cx="20" cy="19" rx="10" ry="6" fill="#FBCFE8" opacity="0.3" />

      {/* Ojo izquierdo — blanco animado */}
      <motion.ellipse
        cx={20} cy={31} rx={9} ry={10.5}
        style={{ transformOrigin: '20px 31px' }}
        animate={{ scaleY: c.whiteScaleY }}
        transition={ETRANS}
        fill="white"
      />
      {/* Pupila izq (cx=22 = levemente al centro) */}
      <motion.circle
        cx={22} cy={28.5} r={6.5}
        style={{ transformOrigin: '22px 28.5px' }}
        animate={{ y: c.pupilDY, scale: c.pupilScale }}
        transition={ETRANS}
        fill="#1C1028"
      />
      <motion.circle
        cx={24.5} cy={25.5} r={2.5}
        style={{ transformOrigin: '24.5px 25.5px' }}
        animate={{ y: c.pupilDY, scale: c.pupilScale }}
        transition={ETRANS}
        fill="white"
      />

      {/* Ojo derecho — blanco animado */}
      <motion.ellipse
        cx={44} cy={31} rx={9} ry={10.5}
        style={{ transformOrigin: '44px 31px' }}
        animate={{ scaleY: c.whiteScaleY }}
        transition={ETRANS}
        fill="white"
      />
      {/* Pupila der (cx=42 = levemente al centro, simétrico al izq) */}
      <motion.circle
        cx={42} cy={28.5} r={6.5}
        style={{ transformOrigin: '42px 28.5px' }}
        animate={{ y: c.pupilDY, scale: c.pupilScale }}
        transition={ETRANS}
        fill="#1C1028"
      />
      <motion.circle
        cx={39.5} cy={25.5} r={2.5}
        style={{ transformOrigin: '39.5px 25.5px' }}
        animate={{ y: c.pupilDY, scale: c.pupilScale }}
        transition={ETRANS}
        fill="white"
      />

      {/* Rubor animado */}
      <motion.ellipse cx={9}  cy={41} rx={8} ry={5} fill="#BE185D"
        animate={{ opacity: c.blushOp }} transition={ETRANS} />
      <motion.ellipse cx={55} cy={41} rx={8} ry={5} fill="#BE185D"
        animate={{ opacity: c.blushOp }} transition={ETRANS} />
    </svg>
  )
}

/* ── Export ─────────────────────────────────────────────────────────────── */
const LubiMascot: React.FC<LubiMascotProps> = ({
  size = 60,
  animated = false,
  variant = 'button',
  expression = 'idle',
  className = '',
}) => (
  <div className={className} style={{ display: 'inline-block', lineHeight: 0 }}>
    {variant === 'chat'
      ? <LubiChatFace size={size} expression={expression} />
      : <LubiButtonFace size={size} animated={animated} />
    }
  </div>
)

export default LubiMascot
