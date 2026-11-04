import { Check } from 'lucide-react';
import { useAuth } from '@presentation/context';
import { useEventGoing } from '@presentation/hooks/events/useEventGoing';

interface GoingButtonProps {
  eventId: string;
  initialCount: number;
}

// "Voy" en vivo: cuántos panas van y un toque para sumarte.
const GoingButton: React.FC<GoingButtonProps> = ({ eventId, initialCount }) => {
  const { user } = useAuth();
  const { going, count, toggle } = useEventGoing(eventId, user?.id, initialCount);

  return (
    <div className="flex items-center justify-between gap-2 pt-1.5">
      <span className="text-[11px] font-semibold text-lg-dim">
        {count === 0 ? 'Sé el primero' : `${count} ${count === 1 ? 'va' : 'van'}`}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); toggle(); }}
        aria-pressed={going}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold transition-all active:scale-95 ${
          going ? 'bg-lg-accent text-lg-ink' : 'bg-lg-text text-lg-ink hover:bg-lg-accent'
        }`}
      >
        {going && <Check className="w-3 h-3" />}
        {going ? 'Voy' : 'Voy yo'}
      </button>
    </div>
  );
};

export default GoingButton;
