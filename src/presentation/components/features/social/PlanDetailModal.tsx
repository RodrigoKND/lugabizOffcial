import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Globe, Lock, Users, X } from 'lucide-react';
import { Plan } from '@domain/entities';
import { useLockBodyScroll } from '@presentation/hooks';

interface PlanDetailModalProps {
  plan: Plan | null;
  currentUserId: string;
  onClose: () => void;
}

const VISIBILITY_LABEL = { private: 'Privado', friends: 'Amigos', public: 'Público' };
const VISIBILITY_ICON = { private: Lock, friends: Users, public: Globe };

function PlanDetailContent({ plan, currentUserId, onClose }: { plan: Plan; currentUserId: string; onClose: () => void }) {
  const isOwner = plan.createdBy === currentUserId;
  const myParticipant = plan.participants.find((p) => p.userId === currentUserId);
  const canSeeAttendees = isOwner || myParticipant?.rsvpStatus === 'accepted';
  const accepted = plan.participants.filter((p) => p.rsvpStatus === 'accepted');
  const VisibilityIcon = VISIBILITY_ICON[plan.visibility];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-video bg-primary-50 shrink-0">
          {plan.targetImage ? (
            <img src={plan.targetImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-primary-200" />
            </div>
          )}
          <button onClick={onClose} aria-label="Cerrar"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold">
            <VisibilityIcon className="w-2.5 h-2.5" /> {VISIBILITY_LABEL[plan.visibility]}
          </span>
        </div>

        <div className="p-5 space-y-3 overflow-y-auto">
          <div>
            <h3 className="text-base font-bold text-text-primary">{plan.targetName || 'Plan'}</h3>
            <p className="text-xs text-text-secondary flex items-center gap-2 mt-1">
              <Calendar className="w-3.5 h-3.5" /> {plan.planDate}
              <Clock className="w-3.5 h-3.5 ml-1.5" /> {plan.planTime}
            </p>
          </div>

          {plan.note && (
            <p className="text-xs text-text-secondary bg-primary-50/50 rounded-xl p-3">{plan.note}</p>
          )}

          <div>
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide mb-2">
              {canSeeAttendees ? `${accepted.length} confirmados` : 'Confirmados'}
            </p>
            {!canSeeAttendees ? (
              <p className="text-xs text-text-secondary">
                Vas a poder ver quién confirmó cuando aceptes la invitación.
              </p>
            ) : accepted.length === 0 ? (
              <p className="text-xs text-text-secondary">Todavía nadie confirmó asistencia.</p>
            ) : (
              <div className="space-y-2">
                {accepted.map((p) => (
                  <div key={p.id} className="flex items-center gap-2.5">
                    {p.userAvatar ? (
                      <img src={p.userAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
                        {(p.userName || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-medium text-text-primary">
                      {p.userName || 'Usuario'}{p.role === 'owner' ? ' (organiza)' : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Detalle de un plan: lugar/evento + quiénes confirmaron. La lista de
// confirmados solo se arma (y el backend solo la entrega) si sos el creador
// o ya aceptaste el plan — ver migración restrict_plan_participants_visibility_to_accepted.
const PlanDetailModal: React.FC<PlanDetailModalProps> = ({ plan, currentUserId, onClose }) => {
  useLockBodyScroll(!!plan);

  return createPortal(
    <AnimatePresence>
      {plan && <PlanDetailContent plan={plan} currentUserId={currentUserId} onClose={onClose} />}
    </AnimatePresence>,
    document.body
  );
};

export default PlanDetailModal;
