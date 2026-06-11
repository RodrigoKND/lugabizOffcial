import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Sparkles } from 'lucide-react';

interface ChatButtonProps {
  isVisible: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ isVisible }) => {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="fixed md:bottom-6 bottom-28 right-6 z-40">
      <div className={`absolute -bottom-2 left-0 right-0 h-0.5 bg-linear-to-r from-emerald-400/0 via-emerald-400/60 to-emerald-400/0 rounded-full transition-opacity duration-500 ${hover ? 'opacity-100' : 'opacity-0'}`} />
      <button
        aria-label="Pregúntame sobre lugares"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="group relative cursor-pointer"
        onClick={() => navigate('/chat')}
      >
        <div className="relative w-14 h-14 sm:w-15 sm:h-15 rounded-2xl bg-white border border-purple-100 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 hover:border-purple-200">
          <MessageCircle className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-400 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>
        <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[11px] font-medium text-purple-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-100">
          Pregúntame
        </span>
      </button>
    </div>
  );
};

export default ChatButton;
