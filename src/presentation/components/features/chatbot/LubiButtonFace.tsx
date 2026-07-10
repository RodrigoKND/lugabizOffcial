import { motion } from 'framer-motion'
import {
  BLINK_ANIM,
  BLINK_TRANS,
  DIZZY_LEFT_PUPIL,
  DIZZY_RIGHT_PUPIL,
  DIZZY_SHINE_L,
  DIZZY_SHINE_R,
  DIZZY_TRANS,
} from './constants'

function LubiButtonFace({ size, animated, dizzy }: { size: number; animated: boolean; dizzy?: boolean }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', display: 'block' }}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="28" fill="#EC4899" />
      <ellipse cx="21" cy="19" rx="10" ry="6" fill="#FBCFE8" opacity="0.3" />

      <motion.g
        animate={!dizzy && animated ? BLINK_ANIM : { scaleY: 0.8 }}
        transition={!dizzy ? BLINK_TRANS : { duration: 0.3 }}
        style={{ transformBox: 'fill-box' }}
      >
        <g style={{ transformOrigin: '20px 32px', transformBox: 'fill-box' }}>
          <ellipse cx="20" cy="32" rx="8.5" ry="9" fill="white" />
        </g>
        <g style={{ transformOrigin: '44px 32px', transformBox: 'fill-box' }}>
          <ellipse cx="44" cy="32" rx="8.5" ry="9" fill="white" />
        </g>
      </motion.g>

      {dizzy ? (
        <>
          <motion.circle
            cx={DIZZY_LEFT_PUPIL.cx[0]} cy={DIZZY_LEFT_PUPIL.cy[0]} r="5.8" fill="#1C1028"
            animate={{ cx: DIZZY_LEFT_PUPIL.cx, cy: DIZZY_LEFT_PUPIL.cy }}
            transition={DIZZY_TRANS}
          />
          <motion.circle
            cx={DIZZY_RIGHT_PUPIL.cx[0]} cy={DIZZY_RIGHT_PUPIL.cy[0]} r="5.8" fill="#1C1028"
            animate={{ cx: DIZZY_RIGHT_PUPIL.cx, cy: DIZZY_RIGHT_PUPIL.cy }}
            transition={DIZZY_TRANS}
          />
          <motion.circle
            cx={DIZZY_SHINE_L.cx[0]} cy={DIZZY_SHINE_L.cy[0]} r="2.2" fill="white"
            animate={{ cx: DIZZY_SHINE_L.cx, cy: DIZZY_SHINE_L.cy }}
            transition={DIZZY_TRANS}
          />
          <motion.circle
            cx={DIZZY_SHINE_R.cx[0]} cy={DIZZY_SHINE_R.cy[0]} r="2.2" fill="white"
            animate={{ cx: DIZZY_SHINE_R.cx, cy: DIZZY_SHINE_R.cy }}
            transition={DIZZY_TRANS}
          />
        </>
      ) : (
        <>
          <circle cx="22" cy="33" r="5.8" fill="#1C1028" />
          <circle cx="42" cy="33" r="5.8" fill="#1C1028" />
          <circle cx="24.5" cy="30" r="2.2" fill="white" />
          <circle cx="39.5" cy="30" r="2.2" fill="white" />
        </>
      )}

      <motion.ellipse
        cx="9" cy="42" rx="7.5" ry="4.5" fill="#BE185D"
        animate={{ opacity: dizzy ? 0.5 : 0.16 }}
        transition={{ duration: 0.3 }}
      />
      <motion.ellipse
        cx="55" cy="42" rx="7.5" ry="4.5" fill="#BE185D"
        animate={{ opacity: dizzy ? 0.5 : 0.16 }}
        transition={{ duration: 0.3 }}
      />
    </svg>
  )
}

export default LubiButtonFace
