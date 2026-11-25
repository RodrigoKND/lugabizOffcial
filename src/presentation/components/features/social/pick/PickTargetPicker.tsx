import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { usePlaces } from '@presentation/context';
import type { PickOptionDraft } from '@presentation/hooks/social/useCreateGroupPick';
import { pickCandidates } from './pickCandidates';

interface PickTargetPickerProps {
  excludeKeys: string[];
  onPick: (draft: PickOptionDraft) => void;
}

// Busca lugares y eventos de Lugabiz para sumarlos como opción. Sin búsqueda sugiere los mejor puntuados.
export default function PickTargetPicker({ excludeKeys, onPick }: PickTargetPickerProps) {
  const { places, events } = usePlaces();
  const [query, setQuery] = useState('');
  const results = useMemo(() => pickCandidates(query, places, events, excludeKeys), [query, places, events, excludeKeys]);

  return (
    <div className="space-y-2">
      <label className="relative block">
        <span className="sr-only">Buscar lugar o evento</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lg-dim" />
        <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Busca un lugar o evento"
          className="h-12 w-full rounded-lg bg-lg-surface-2 pl-9 pr-3 text-sm font-semibold text-lg-text outline-none placeholder:text-lg-dim focus-visible:ring-2 focus-visible:ring-lg-accent" />
      </label>
      <ul className="max-h-52 space-y-1 overflow-y-auto">
        {results.map(c => (
          <li key={c.key}>
            <button type="button" onClick={() => onPick(c)}
              className="flex h-14 w-full items-center gap-3 rounded-lg bg-lg-surface-2 px-2 text-left transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-lg-accent">
              {c.image ? <img src={c.image} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-md object-cover" />
                : <span className="h-10 w-10 shrink-0 rounded-md bg-lg-surface" />}
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-lg-text">{c.name}</span>
              <span className="text-xs font-bold text-lg-dim">{c.eventId ? 'Evento' : 'Lugar'}</span>
              <Plus className="h-5 w-5 shrink-0 text-lg-accent" />
            </button>
          </li>
        ))}
        {results.length === 0 && <li className="p-3 text-sm text-lg-dim">Sin resultados. Prueba con otra palabra.</li>}
      </ul>
    </div>
  );
}
