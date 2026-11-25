import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Vote } from 'lucide-react';
import { useMyGroupPicks } from '@presentation/hooks/social/useMyGroupPicks';
import CreateGroupPickModal from './CreateGroupPickModal';

const STATUS_LABEL = { open: 'Abierta', decided: 'Ya hay plan', cancelled: 'Cancelada' } as const;

// En la pestaña Planes: tus votaciones y el botón para armar una nueva ("¿Dónde vamos?").
export default function GroupPicksList() {
  const { picks, reload } = useMyGroupPicks();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <section aria-label="Votaciones con amigos" className="space-y-2">
      <button type="button" onClick={() => setShowCreate(true)}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-lg-accent text-lg font-black text-lg-ink transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lg-text">
        <Vote className="h-5 w-5" /> ¿Dónde vamos?
      </button>

      {picks.length > 0 && (
        <ul className="space-y-2">
          {picks.map(p => (
            <li key={p.id}>
              <Link to={`/votacion/${p.id}`} className="flex min-h-14 items-center gap-3 rounded-xl border-2 border-lg-surface-2 bg-lg-surface px-3 py-2 transition-colors hover:border-lg-accent">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-flyer-sm text-lg text-lg-text">{p.title || 'Votación'}</p>
                  <p className="truncate text-xs font-semibold text-lg-dim">{p.creatorName} · {p.memberCount} personas · {p.planDate} {p.planTime}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${p.status === 'open' ? 'bg-lg-maiz text-lg-ink' : 'bg-lg-surface-2 text-lg-dim'}`}>{STATUS_LABEL[p.status]}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <CreateGroupPickModal isOpen={showCreate} onClose={() => { setShowCreate(false); reload(); }} />
    </section>
  );
}
