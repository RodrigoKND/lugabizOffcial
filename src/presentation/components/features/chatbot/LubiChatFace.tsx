import { motion } from 'framer-motion'
import { EXPR, ETRANS } from './constants'
import { type LubiExpression } from './types'

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

      <motion.ellipse
        cx={20} cy={31} rx={9} ry={10.5}
        style={{ transformOrigin: '20px 31px' }}
        animate={{ scaleY: c.whiteScaleY }}
        transition={ETRANS}
        fill="white"
      />
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

      <motion.ellipse
        cx={44} cy={31} rx={9} ry={10.5}
        style={{ transformOrigin: '44px 31px' }}
        animate={{ scaleY: c.whiteScaleY }}
        transition={ETRANS}
        fill="white"
      />
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

      <motion.ellipse cx={9}  cy={41} rx={8} ry={5} fill="#BE185D"
        animate={{ opacity: c.blushOp }} transition={ETRANS} />
      <motion.ellipse cx={55} cy={41} rx={8} ry={5} fill="#BE185D"
        animate={{ opacity: c.blushOp }} transition={ETRANS} />
    </svg>
  )
}

export default LubiChatFace
