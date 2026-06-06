import { ChevronLeft, ChevronRight } from 'lucide-react';

export function EventModalPrev({ hasPrev, onPrev }: { hasPrev: boolean; onPrev: () => void }) {
  if (!hasPrev) return null;
  return (
    <button onClick={(e) => { e.stopPropagation(); onPrev(); }}
      className="absolute left-1 md:static cursor-pointer z-20 items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/50 backdrop-blur-md hover:bg-white/25 transition-all text-white shrink-0 flex">
      <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
    </button>
  );
}

export function EventModalNext({ hasNext, onNext }: { hasNext: boolean; onNext: () => void }) {
  if (!hasNext) return null;
  return (
    <button onClick={(e) => { e.stopPropagation(); onNext(); }}
      className="absolute right-1 md:static cursor-pointer z-20 items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/50 backdrop-blur-md hover:bg-white/25 transition-all text-white shrink-0 flex">
      <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
    </button>
  );
}
