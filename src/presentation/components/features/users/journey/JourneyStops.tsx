import { Check } from 'lucide-react';
import type { JourneyStage } from './journeyStages';

interface JourneyStopsProps {
  stages: JourneyStage[];
}

const DOT = {
  done: 'bg-lg-accent border-lg-accent text-lg-ink',
  current: 'bg-lg-maiz border-lg-text text-lg-ink scale-110',
  todo: 'bg-lg-surface-2 border-lg-surface-2 text-lg-dim',
};

// Línea de paradas estilo mapa de metro: hecha (lila), actual (maíz) y pendiente (apagada).
export default function JourneyStops({ stages }: JourneyStopsProps) {
  return (
    <ol className="flex items-start">
      {stages.map((s, i) => (
        <li key={s.id} aria-current={s.status === 'current' ? 'step' : undefined} className="flex flex-1 flex-col items-center gap-1 text-center">
          <div className="flex w-full items-center">
            <span className={`h-1 flex-1 ${i === 0 ? 'opacity-0' : s.status === 'todo' ? 'bg-lg-surface-2' : 'bg-lg-accent'}`} />
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black transition-transform ${DOT[s.status]}`}>
              {s.status === 'done' ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`h-1 flex-1 ${i === stages.length - 1 ? 'opacity-0' : s.status === 'done' ? 'bg-lg-accent' : 'bg-lg-surface-2'}`} />
          </div>
          <span className={`px-1 text-[11px] font-bold leading-tight ${s.status === 'todo' ? 'text-lg-dim' : 'text-lg-text'}`}>{s.title}</span>
        </li>
      ))}
    </ol>
  );
}
