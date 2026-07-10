import LubiButtonFace from './LubiButtonFace'
import LubiChatFace from './LubiChatFace'
import { type LubiMascotProps } from './types'

const LubiMascot: React.FC<LubiMascotProps> = ({
  size = 60,
  animated = false,
  variant = 'button',
  expression = 'idle',
  className = '',
  dizzy = false,
}) => (
  <div className={className} style={{ display: 'inline-block', lineHeight: 0 }}>
    {variant === 'chat'
      ? <LubiChatFace size={size} expression={expression} />
      : <LubiButtonFace size={size} animated={animated} dizzy={dizzy} />
    }
  </div>
)

export default LubiMascot
