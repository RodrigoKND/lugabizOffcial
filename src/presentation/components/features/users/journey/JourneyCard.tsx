import { useNavigate } from 'react-router-dom';
import { ArrowRight, Store } from 'lucide-react';
import type { User } from '@domain/entities';
import { useJourney } from '@presentation/hooks/users/useJourney';
import JourneyStops from './JourneyStops';

interface JourneyCardProps {
  user: User;
  placesCount: number;
  docsApproved: boolean;
  onVerify: () => void;
  onManageBusinesses: () => void;
}

// "Tu camino": hace visible ser dueño. Un solo botón grande con la acción de la parada actual.
export default function JourneyCard({ user, placesCount, docsApproved, onVerify, onManageBusinesses }: JourneyCardProps) {
  const navigate = useNavigate();
  const { stages, current, doneCount, isComplete } = useJourney(user, placesCount, docsApproved);

  const handleAction = () => {
    if (!current) { onManageBusinesses(); return; }
    if (current.action === 'add-place') navigate('/add-place');
    else onVerify();
  };

  return (
    <section aria-labelledby="journey-title" className="mb-6 rounded-xl border-2 border-lg-text bg-lg-surface p-4 poster-shadow">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="journey-title" className="font-flyer-sm text-2xl text-lg-text">Tu camino</h2>
        <span className="text-xs font-bold text-lg-dim">{doneCount}/{stages.length}</span>
      </div>

      <JourneyStops stages={stages} />

      <button type="button" onClick={handleAction}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-lg-accent px-4 font-bold text-lg-ink transition-transform active:scale-95">
        {isComplete ? <Store className="h-5 w-5" /> : null}
        <span>{isComplete ? 'Mis negocios' : current?.title}</span>
        {!isComplete && <ArrowRight className="h-5 w-5" />}
      </button>
      <p className="mt-2 text-center text-xs text-lg-dim">{isComplete ? '¡Negocio verificado! Ya tienes la insignia dorada.' : current?.hint}</p>

      {user.isOwner && !isComplete && (
        <button type="button" onClick={onManageBusinesses}
          className="mt-1 h-11 w-full text-sm font-semibold text-lg-accent underline-offset-4 hover:underline">
          Mis negocios
        </button>
      )}
    </section>
  );
}
