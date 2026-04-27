import React from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';

interface ChatButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick, isVisible }) => {
  if (!isVisible) return null;

  return (
    <button
      aria-label="Pregúntame sobre lugares"
      title="Pregúntame sobre lugares"
      className="fixed bottom-2 left-6 z-40 group"
      onClick={onClick}
    >
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-75 blur-lg group-hover:opacity-100 transition-opacity animate-pulse" />
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95">
          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
          <Sparkles className="w-3 h-3 text-amber-900" />
        </div>
      </div>
      <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-medium text-slate-600 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Pregúntame
      </span>
    </button>
  );
};

export default ChatButton;