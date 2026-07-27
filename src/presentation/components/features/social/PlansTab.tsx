import { CalendarCheck2 } from 'lucide-react';
import { usePlans } from '@presentation/hooks';
import { useAuth } from '@presentation/context';
import PlanListItem from './PlanListItem';
import PushEnableBanner from './PushEnableBanner';

const PlansTab: React.FC = () => {
  const { user } = useAuth();
  const { plans, respondToInvite } = usePlans();
  if (!user) return null;

  const pendingInvites = plans.filter((plan) =>
    plan.participants.some((p) => p.userId === user.id && p.role === 'invitee' && p.rsvpStatus === 'pending')
  );
  const confirmedPlans = plans.filter((plan) => !pendingInvites.includes(plan));

  if (plans.length === 0) {
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
          <div className="space-y-2">
            {confirmedPlans.map((plan) => (
              <PlanListItem key={plan.id} plan={plan} currentUserId={user.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansTab;
