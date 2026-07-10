import { type LubiExpression } from './types'

export const EXPR: Record<LubiExpression, {
  whiteScaleY: number
  pupilDY: number
  pupilScale: number
  blushOp: number
}> = {
  idle:     { whiteScaleY: 1,    pupilDY: 0,   pupilScale: 1,    blushOp: 0.18 },
  happy:    { whiteScaleY: 0.46, pupilDY: 3.5, pupilScale: 0.6,  blushOp: 0.48 },
  thinking: { whiteScaleY: 0.76, pupilDY: -2,  pupilScale: 0.9,  blushOp: 0.10 },
}
export const ETRANS = { duration: 0.22, ease: 'easeOut' as const }

export const BLINK_ANIM = { scaleY: [1, 0.05, 1] as number[] }
export const BLINK_TRANS = {
  duration: 0.16,
  ease: 'linear' as const,
  repeat: Infinity,
  repeatDelay: 3.6,
}

export const DIZZY_LEFT_PUPIL = {
  cx: [22, 25, 24, 20, 16, 15, 18, 22, 22] as number[],
  cy: [33, 30, 26, 25, 28, 32, 36, 36, 33] as number[],
}
export const DIZZY_RIGHT_PUPIL = {
  cx: [42, 45, 44, 40, 36, 35, 38, 42, 42] as number[],
  cy: [33, 30, 26, 25, 28, 32, 36, 36, 33] as number[],
}
export const DIZZY_SHINE_L = {
  cx: [24.5, 27.5, 26.5, 22.5, 18.5, 17.5, 20.5, 24.5, 24.5] as number[],
  cy: [30, 27, 23, 22, 25, 29, 33, 33, 30] as number[],
}
export const DIZZY_SHINE_R = {
  cx: [39.5, 42.5, 41.5, 37.5, 33.5, 32.5, 35.5, 39.5, 39.5] as number[],
  cy: [30, 27, 23, 22, 25, 29, 33, 33, 30] as number[],
}
export const DIZZY_TRANS = {
  duration: 0.6,
  repeat: Infinity,
  ease: 'linear' as const,
}
