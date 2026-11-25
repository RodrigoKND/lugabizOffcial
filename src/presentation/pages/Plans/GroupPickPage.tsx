import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { groupPickPrimaryAction, planInviteeIds } from '@domain/rules/groupPickState';
import { useAuth } from '@presentation/context';
import { useSmartBack } from '@presentation/hooks';
import { useGroupPick } from '@presentation/hooks/social/useGroupPick';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import CreatePlanModal from '@presentation/components/features/social/CreatePlanModal';
import PickOptionCard from '@presentation/components/features/social/pick/PickOptionCard';
import PickActions from '@presentation/components/features/social/pick/PickActions';
import PickTargetPicker from '@presentation/components/features/social/pick/PickTargetPicker';

const formatDay = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
};

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-lg-ground px-6 text-center text-lg-text">{children}</div>
);

// "¿Dónde vamos?": las opciones, tu voto y el resultado en una sola pantalla. Un botón principal según el estado.
export default function GroupPickPage() {
  const { id } = useParams<{ id: string }>();
  const goBack = useSmartBack('/profile?tab=plans');
  const { user } = useAuth();
  const g = useGroupPick(id);
  const [showPlan, setShowPlan] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  if (g.isLoading) return <Shell><Loader2 className="h-8 w-8 animate-spin text-lg-accent" /></Shell>;
  if (!user) return <Shell><p>Inicia sesión para ver esta votación.</p><Link to="/?auth=login" className="flex h-12 items-center rounded-lg bg-lg-accent px-6 font-bold text-lg-ink">Iniciar sesión</Link></Shell>;
  if (!g.detail) return <Shell><h1 className="font-flyer-sm text-3xl">Votación no encontrada</h1><p className="text-sm text-lg-dim">No existe o no te invitaron.</p><button onClick={goBack} className="h-12 rounded-lg bg-lg-accent px-6 font-bold text-lg-ink">Volver</button></Shell>;

  const { pick, members, options, votes } = g.detail;
  const myVotedAll = options.length > 0 && options.every(o => g.myVotes[o.id]);
  const action = groupPickPrimaryAction({ status: pick.status, isOpen: g.isOpen, isCreator: g.isCreator, myVotedAll, hasWinner: !!g.winnerId });
  const winner = options.find(o => o.id === pick.winnerOptionId);
  const inviteeIds = planInviteeIds(members, votes, user.id);

  return (
    <div className="min-h-screen bg-lg-ground pb-24 text-lg-text md:pb-8">
      <div className="mx-auto max-w-xl px-4 py-4">
        <button onClick={goBack} className="mb-3 flex h-11 items-center gap-2 font-bold text-lg-dim hover:text-lg-text"><ArrowLeft className="h-5 w-5" /> Volver</button>

        <header className="mb-4">
          <h1 className="font-flyer text-4xl text-balance">{pick.title || '¿Dónde vamos?'}</h1>
          <p className="mt-1 text-sm font-semibold capitalize text-lg-dim">{formatDay(pick.planDate)} · {pick.planTime}</p>
          <ul className="mt-3 flex -space-x-2" aria-label={`${members.length} personas`}>
            {members.map(m => (
              <li key={m.userId} title={m.name}>
                {m.avatar ? <img src={m.avatar} alt={m.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-lg-ground" />
                  : <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lg-surface-2 text-xs font-black text-lg-accent ring-2 ring-lg-ground">{m.name.charAt(0).toUpperCase()}</span>}
              </li>
            ))}
          </ul>
        </header>

        <ul className="space-y-3">
          {options.map(o => (
            <PickOptionCard key={o.id} option={o} tally={g.tally.find(t => t.optionId === o.id)} mine={g.myVotes[o.id]}
              isLeader={pick.status === 'open' && g.winnerId === o.id} isWinner={pick.winnerOptionId === o.id}
              canVote={g.isOpen} onVote={v => g.vote(o.id, v)} />
          ))}
        </ul>

        {g.isOpen && options.length < 4 && (
          <div className="mt-3">
            {showAdd
              ? <PickTargetPicker excludeKeys={options.map(o => (o.placeId ? `place:${o.placeId}` : `event:${o.eventId}`))}
                  onPick={d => { g.addOption({ placeId: d.placeId, eventId: d.eventId }); setShowAdd(false); }} />
              : <button type="button" onClick={() => setShowAdd(true)} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-lg-surface-2 text-sm font-bold text-lg-dim hover:text-lg-text"><Plus className="h-4 w-4" /> Sumar opción</button>}
          </div>
        )}

        <div className="mt-6">
          <PickActions action={action} status={pick.status} canCancel={g.isCreator && pick.status === 'open'}
            onClose={() => g.winnerId && g.decide(g.winnerId)} onGo={() => setShowPlan(true)} onCancel={() => setShowCancel(true)} />
        </div>
      </div>

      {winner && (
        <CreatePlanModal isOpen={showPlan} onClose={() => setShowPlan(false)} targetName={winner.name} placeId={winner.placeId} eventId={winner.eventId}
          defaults={{ planDate: pick.planDate, planTime: pick.planTime, invitees: members.filter(m => inviteeIds.includes(m.userId)).map(m => ({ id: m.userId, name: m.name, username: m.username ?? '', avatar: m.avatar })) }} />
      )}
      <ConfirmDialog open={showCancel} onClose={() => setShowCancel(false)} onConfirm={async () => { setShowCancel(false); if (await g.cancel()) goBack(); }}
        title="Cancelar votación" message="Se borra la votación para todos. ¿Seguro?" confirmLabel="Cancelar votación" variant="danger" />
    </div>
  );
}
