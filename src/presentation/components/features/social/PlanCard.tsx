import { Calendar, Globe, Lock, Users, X } from 'lucide-react';
import { Plan } from '@domain/entities';

interface PlanCardProps {
  plan: Plan;
  currentUserId: string;
  onCancel?: () => void;
  onClick?: () => void;
}

const VISIBILITY_ICON = { private: Lock, friends: Users, public: Globe };

// Tarjeta compacta pensada para una grilla (a diferencia de PlanListItem, que
// es la versión detallada con aceptar/rechazar para invitaciones pendientes).
const PlanCard: React.FC<PlanCardProps> = ({ plan, currentUserId, onCancel, onClick }) => {
  const isOwner = plan.createdBy === currentUserId;
  const acceptedCount = plan.participants.filter((p) => p.rsvpStatus === 'accepted').length;
  const VisibilityIcon = VISIBILITY_ICON[plan.visibility];

  return (
    <div onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick?.(); }}
      className="relative group bg-white rounded-2xl border border-primary-100/50 overflow-hidden hover:shadow-sm transition-shadow cursor-pointer">
      {isOwner && onCancel && (
        <button onClick={(e) => { e.stopPropagation(); onCancel(); }} aria-label="Cancelar plan"
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-red-500 transition-colors">
          <X className="w-4 h-4" />
        </button>
      )}
      <div className="aspect-video bg-primary-50 relative overflow-hidden">
        {plan.targetImage ? (
          <img src={plan.targetImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary-200" />
          </div>
        )}
        <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold">
          <VisibilityIcon className="w-2.5 h-2.5" />
        </span>
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-text-primary truncate">{plan.targetName || 'Plan'}</p>
        <p className="text-[10px] text-text-secondary mt-0.5">{plan.planDate} · {plan.planTime}</p>
        <p className="text-[10px] text-text-secondary mt-0.5">{acceptedCount} confirmados</p>
      </div>
    </div>
  );
};

export default PlanCard;
