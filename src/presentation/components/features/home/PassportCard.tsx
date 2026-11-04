import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@presentation/context';
import { usePassport } from '@presentation/hooks/home/usePassport';
import { PASSPORT_GOAL } from '@lib/supabase/services/chispa/passportLevel';
import StampBadge from '@presentation/components/features/passport/StampBadge';

const SLOTS = 3;

// Entrada al pasaporte cochabambino: últimos sellos + progreso. Lleva a /pasaporte.
const PassportCard: React.FC = () => {
  const { user } = useAuth();
  const { stamps, level } = usePassport(user?.id);

  return (
    <Link to="/pasaporte" className="block bg-lg-surface hover:bg-lg-surface-2 transition-colors rounded-3xl p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-flyer-sm text-xl text-lg-text">Tu pasaporte</h3>
        <ChevronRight className="w-4 h-4 text-lg-accent" />
      </div>
      <div className="flex gap-2 my-3">
        {Array.from({ length: SLOTS }, (_, i) => stamps[i]).map((s, i) => (
          <StampBadge key={s?.placeId ?? `empty-${i}`} label={s?.name} tilt={i === 1 ? -6 : 0} />
        ))}
      </div>
      <div className="h-2 rounded-full bg-lg-surface-2 overflow-hidden">
        <div className="h-full rounded-full bg-lg-accent transition-all" style={{ width: `${Math.round(level.progress * 100)}%` }} />
      </div>
      <p className="mt-2 text-[11px] font-semibold text-lg-dim">
        {user ? `${stamps.length} de ${PASSPORT_GOAL} sellos · ${level.name}` : 'Inicia sesión para empezar'}
      </p>
    </Link>
  );
};

export default PassportCard;
