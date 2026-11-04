import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth, usePlaces } from '@presentation/context';
import { pickPlanTarget } from '@presentation/hooks/home/pickPlanTarget';
import CreatePlanModal from '@presentation/components/features/social/CreatePlanModal';

// "Tu plan de hoy": sugiere el próximo evento (o el mejor lugar) y abre el creador de planes existente.
const PlanTodayCard: React.FC = () => {
  const { user } = useAuth();
  const { events, places } = usePlaces();
  const [open, setOpen] = useState(false);
  const target = useMemo(() => pickPlanTarget(events, places), [events, places]);

  const handleClick = () => {
    if (!user) { toast.error('Inicia sesión para crear un plan'); return; }
    setOpen(true);
  };

  return (
    <div className="bg-lg-surface rounded-3xl p-4 flex flex-col">
      <h3 className="font-flyer-sm text-xl text-lg-text">Tu plan de hoy</h3>
      <p className="my-3 text-xs font-bold text-lg-text line-clamp-2">
        {target ? <><span className="text-lg-accent">{target.when} · </span>{target.name}</> : 'Aún no hay sugerencias'}
      </p>
      <button onClick={handleClick} disabled={!target}
        className="mt-auto self-start rounded-full bg-lg-accent px-3.5 py-2 text-xs font-extrabold text-lg-ink hover:brightness-110 transition disabled:opacity-40">
        Crear plan
      </button>
      {target && (
        <CreatePlanModal isOpen={open} onClose={() => setOpen(false)} targetName={target.name}
          placeId={target.placeId} eventId={target.eventId} />
      )}
    </div>
  );
};

export default PlanTodayCard;
