import { Calendar, Check, Clock, Globe, Lock, Users, X } from 'lucide-react';
import { Plan } from '@domain/entities';

interface PlanListItemProps {
  plan: Plan;
  currentUserId: string;
  onAccept?: (participantId: string) => void;
  onDecline?: (participantId: string) => void;
}

const VISIBILITY_ICON = { private: Lock, friends: Users, public: Globe };

// Quién confirmó no se muestra acá a propósito: esta tarjeta es para invitaciones
// TODAVÍA no aceptadas, y esa lista solo es visible para el creador o quien ya
// aceptó (ver migración restrict_plan_participants_visibility_to_accepted).
const PlanListItem: React.FC<PlanListItemProps> = ({ plan, currentUserId, onAccept, onDecline }) => {
  const myParticipant = plan.participants.find((p) => p.userId === currentUserId);
  const isPendingInvite = myParticipant?.role === 'invitee' && myParticipant.rsvpStatus === 'pending';
  const VisibilityIcon = VISIBILITY_ICON[plan.visibility];

  return (
    <div className="bg-white rounded-xl p-4 border border-primary-100/40">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-text-primary truncate">{plan.targetName || 'Plan'}</h4>
          <p className="text-xs text-text-secondary flex items-center gap-2 mt-0.5">
            <Calendar className="w-3 h-3" /> {plan.planDate}
            <Clock className="w-3 h-3 ml-1.5" /> {plan.planTime}
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary-50 text-primary-600 text-[10px] font-semibold">
          <VisibilityIcon className="w-3 h-3" /> {plan.visibility === 'private' ? 'Privado' : plan.visibility === 'friends' ? 'Amigos' : 'Público'}
        </span>
      </div>

      {isPendingInvite && myParticipant && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onAccept?.(myParticipant.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors"
          >
            <Check className="w-3.5 h-3.5" /> Aceptar
          </button>
          <button
            onClick={() => onDecline?.(myParticipant.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-stone-100 text-stone-600 rounded-lg text-xs font-semibold hover:bg-stone-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Rechazar
          </button>
        </div>
      )}
    </div>
  );
};

export default PlanListItem;
