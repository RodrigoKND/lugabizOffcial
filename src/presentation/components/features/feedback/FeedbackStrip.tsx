import { useState } from 'react';
import FeedbackModal from './FeedbackModal';

// Franja fina bajo el header de la Home: invita a opinar sin sumar scroll.
const FeedbackStrip: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-3">
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between gap-3 rounded-full bg-lg-surface hover:bg-lg-surface-2 transition-colors pl-4 pr-1.5 py-1.5 text-left">
        <span className="text-xs font-bold text-lg-text truncate">
          ¿Qué mejorarías de Lugabiz? <span className="font-semibold text-lg-dim hidden sm:inline">Cuéntanos, te leemos.</span>
        </span>
        <span className="shrink-0 rounded-full bg-lg-accent px-3.5 py-1.5 text-[11px] font-extrabold text-lg-ink">Opinar</span>
      </button>
      <FeedbackModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default FeedbackStrip;
