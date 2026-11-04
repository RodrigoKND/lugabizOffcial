import { useAuth } from '@presentation/context';
import { usePassport } from '@presentation/hooks/home/usePassport';
import { PASSPORT_GOAL } from '@lib/supabase/services/chispa/passportLevel';

const SLOTS = 3;

// "Tu pasaporte cochabambino": sellos de texto por lugar visitado + progreso de nivel.
const PassportCard: React.FC = () => {
  const { user } = useAuth();
  const { stamps, level } = usePassport(user?.id);
  const shown = stamps.slice(0, SLOTS);

  return (
    <div className="bg-lg-surface rounded-3xl p-4">
      <h3 className="font-flyer-sm text-xl text-lg-text">Tu pasaporte</h3>
      <div className="flex gap-2 my-3">
        {Array.from({ length: SLOTS }, (_, i) => shown[i]).map((s, i) => (
          <span key={s?.placeId ?? `empty-${i}`}
            className={`w-11 h-11 rounded-full border-2 border-dashed grid place-items-center text-center font-display text-[8px] font-black uppercase leading-tight px-0.5 ${
              s ? 'border-lg-accent text-lg-accent' : 'border-lg-surface-2 text-lg-surface-2'
            } ${i === 1 ? '-rotate-6' : ''}`}>
            <span className="line-clamp-2">{s?.name ?? '?'}</span>
          </span>
        ))}
      </div>
      <div className="h-2 rounded-full bg-lg-surface-2 overflow-hidden">
        <div className="h-full rounded-full bg-lg-accent transition-all" style={{ width: `${Math.round(level.progress * 100)}%` }} />
      </div>
      <p className="mt-2 text-[11px] font-semibold text-lg-dim">
        {!user
          ? 'Inicia sesión para empezar tu pasaporte'
          : `${stamps.length} de ${PASSPORT_GOAL} sellos · ${level.name}`}
      </p>
    </div>
  );
};

export default PassportCard;
