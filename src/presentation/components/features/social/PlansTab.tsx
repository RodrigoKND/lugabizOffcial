import { useState } from 'react';
import { CalendarCheck2, Loader2 } from 'lucide-react';
import { usePlans, useInfiniteScroll } from '@presentation/hooks';
import { useAuth } from '@presentation/context';
import { Plan } from '@domain/entities';
import PlanListItem from './PlanListItem';
import PlanCard from './PlanCard';
import CancelPlanModal from './CancelPlanModal';
import PushEnableBanner from './PushEnableBanner';

const PlansTab: React.FC = () => {
  const { user } = useAuth();
  const { plans, isLoading, isLoadingMore, hasMore, loadMore, respondToInvite, cancelPlan } = usePlans();
  const [planToCancel, setPlanToCancel] = useState<Plan | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !isLoading);

  if (!user) return null;

  const activePlans = plans.filter((plan) => plan.status === 'active');
  const pendingInvites = activePlans.filter((plan) =>
    plan.participants.some((p) => p.userId === user.id && p.role === 'invitee' && p.rsvpStatus === 'pending')
  );
  const confirmedPlans = activePlans.filter((plan) => !pendingInvites.includes(plan));

  const handleConfirmCancel = async (reason: string) => {
    if (!planToCancel) return;
    setIsCancelling(true);
    await cancelPlan(planToCancel.id, reason);
    setIsCancelling(false);
    setPlanToCancel(null);
  };

  if (!isLoading && plans.length === 0) {
    return (
      <div className="space-y-3">
        <PushEnableBanner />
        <div className="bg-white rounded-2xl p-12 text-center border border-primary-100/40">
          <CalendarCheck2 className="w-10 h-10 text-primary-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-text-primary mb-1">Sin planes todavía</h3>
          <p className="text-xs text-text-secondary">Tocá el botón "Planes" en un lugar o evento para invitar a tus amigos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PushEnableBanner />

      {pendingInvites.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide px-1">
            {pendingInvites.length} {pendingInvites.length === 1 ? 'invitación pendiente' : 'invitaciones pendientes'}
          </p>
          <div className="space-y-2">
            {pendingInvites.map((plan) => (
              <PlanListItem
                key={plan.id}
                plan={plan}
                currentUserId={user.id}
                onAccept={(participantId) => respondToInvite(participantId, true)}
                onDecline={(participantId) => respondToInvite(participantId, false)}
              />
            ))}
          </div>
        </div>
      )}

      {confirmedPlans.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide px-1">Mis planes</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {confirmedPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                currentUserId={user.id}
                onCancel={plan.createdBy === user.id ? () => setPlanToCancel(plan) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Centinela: al entrar en pantalla dispara la carga de la siguiente
          tanda (scroll progresivo, sin botón "cargar más" ni paginación). */}
      <div ref={sentinelRef} className="h-1" />
      {isLoadingMore && (
        <div className="flex justify-center py-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
        </div>
      )}

      <CancelPlanModal
        isOpen={!!planToCancel}
        onClose={() => setPlanToCancel(null)}
        onConfirm={handleConfirmCancel}
        isSubmitting={isCancelling}
      />
    </div>
  );
};

export default PlansTab;
