export type LubiExpression = 'idle' | 'happy' | 'thinking'

export interface LubiMascotProps {
  size?: number
  animated?: boolean
  variant?: 'button' | 'chat'
  expression?: LubiExpression
  className?: string
  dizzy?: boolean
}
