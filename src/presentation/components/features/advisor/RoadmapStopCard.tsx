import { Check, Flag } from 'lucide-react';
import type { RoadmapStop } from './roadmap';

interface RoadmapStopCardProps {
  stop: RoadmapStop;
  index: number;
  isLast: boolean;
  isDone: boolean;
  isCurrent: boolean;
  onToggle: () => void;
  onDetail: () => void;
  onFinish: () => void;
}

// Una parada del camino: punto en la línea + tarjeta con resumen y una acción. La última lleva a Lugabiz.
export default function RoadmapStopCard({ stop, index, isLast, isDone, isCurrent, onToggle, onDetail, onFinish }: RoadmapStopCardProps) {
  const dot = isDone ? 'bg-lg-accent text-lg-ink border-lg-accent' : isCurrent ? 'bg-lg-maiz text-lg-ink border-lg-text scale-110' : 'bg-lg-surface-2 text-lg-dim border-lg-surface-2';

  return (
    <li aria-current={isCurrent ? 'step' : undefined} className="relative flex gap-3">
      {!isLast && <span aria-hidden="true" className={`absolute left-[13px] top-8 -bottom-3 w-1 ${isDone ? 'bg-lg-accent' : 'bg-lg-surface-2'}`} />}
      <span className={`z-10 mt-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black ${dot}`}>
        {isDone ? <Check className="h-4 w-4" /> : isLast ? <Flag className="h-3.5 w-3.5" /> : index + 1}
      </span>

      <div className={`min-w-0 flex-1 rounded-xl border-2 bg-lg-surface p-3 ${isCurrent ? 'border-lg-text poster-shadow' : 'border-lg-surface-2'}`}>
        <h3 className="font-flyer-sm text-xl text-lg-text">{stop.title}</h3>
        <p className="mt-0.5 text-sm text-lg-dim">{stop.summary}</p>

        {isLast ? (
          <button type="button" onClick={onFinish}
            className="mt-3 h-12 w-full rounded-lg bg-lg-maiz px-4 font-bold text-lg-ink transition-transform active:scale-95">
            Verificar mi negocio
          </button>
        ) : (
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={onDetail}
              className="h-11 flex-1 rounded-lg bg-lg-surface-2 px-3 text-sm font-bold text-lg-text transition-transform active:scale-95">
              Ver detalle
            </button>
            <button type="button" onClick={onToggle} aria-pressed={isDone}
              className={`h-11 flex-1 rounded-lg px-3 text-sm font-bold transition-transform active:scale-95 ${isDone ? 'bg-lg-accent text-lg-ink' : 'border-2 border-lg-accent text-lg-accent'}`}>
              {isDone ? 'Listo ✓' : 'Marcar listo'}
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
