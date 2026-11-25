import { useState } from 'react';
import { X } from 'lucide-react';
import { MAX_INVITEES, MAX_OPTIONS } from '@domain/rules/groupPickLimits';
import { useFriendSearch } from '@presentation/hooks';
import { useCreateGroupPick, type PickOptionDraft } from '@presentation/hooks/social/useCreateGroupPick';
import FriendPickerItem from '../FriendPickerItem';
import PickTargetPicker from './PickTargetPicker';

interface CreateGroupPickFormProps {
  initial?: PickOptionDraft;
  onCreated: (pickId: string) => void;
}

const FIELD = 'h-12 w-full rounded-lg bg-lg-surface-2 px-3 text-sm font-semibold text-lg-text outline-none focus-visible:ring-2 focus-visible:ring-lg-accent';
const LABEL = 'mb-1.5 block text-xs font-bold text-lg-dim';

// Formulario de la votación. Vive solo mientras el modal está abierto, así arranca limpio cada vez.
export default function CreateGroupPickForm({ initial, onCreated }: CreateGroupPickFormProps) {
  const [filter, setFilter] = useState('');
  const { options: friends, isLoading } = useFriendSearch(filter, 20, true);
  const f = useCreateGroupPick(initial, onCreated);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-5 overflow-y-auto p-4">
      <div>
        <label className={LABEL} htmlFor="pick-title">Nombre (opcional)</label>
        <input id="pick-title" value={f.title} maxLength={60} onChange={e => f.setTitle(e.target.value)} placeholder="Ej: Plan del sábado" className={FIELD} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={LABEL} htmlFor="pick-date">Fecha</label><input id="pick-date" type="date" min={today} value={f.planDate} onChange={e => f.setPlanDate(e.target.value)} className={FIELD} /></div>
        <div><label className={LABEL} htmlFor="pick-time">Hora</label><input id="pick-time" type="time" value={f.planTime} onChange={e => f.setPlanTime(e.target.value)} className={FIELD} /></div>
      </div>

      <section aria-label="Amigos">
        <p className={LABEL}>Amigos ({f.invitees.length}/{MAX_INVITEES})</p>
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Busca un amigo" aria-label="Buscar amigo" className={`${FIELD} mb-2`} />
        <div className="max-h-48 space-y-1.5 overflow-y-auto">
          {friends.map(fr => (
            <FriendPickerItem key={fr.userId} friend={fr} selected={f.invitees.some(i => i.id === fr.userId)}
              onToggle={() => f.toggleInvitee({ id: fr.userId, name: fr.name, username: fr.username ?? '', avatar: fr.avatar })} />
          ))}
          {!isLoading && friends.length === 0 && <p className="p-2 text-sm text-lg-dim">No hay amigos para mostrar. Agrégalos desde Amigos.</p>}
        </div>
      </section>

      <section aria-label="Opciones">
        <p className={LABEL}>Opciones ({f.options.length}/{MAX_OPTIONS})</p>
        <ul className="mb-2 flex flex-wrap gap-2">
          {f.options.map(o => (
            <li key={o.key} className="flex h-10 items-center gap-1 rounded-full bg-lg-accent pl-3 pr-1 text-sm font-bold text-lg-ink">
              <span className="max-w-[10rem] truncate">{o.name}</span>
              <button type="button" onClick={() => f.removeOption(o.key)} aria-label={`Quitar ${o.name}`} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-lg-ink/10"><X className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
        {f.options.length < MAX_OPTIONS && <PickTargetPicker excludeKeys={f.options.map(o => o.key)} onPick={f.addOption} />}
      </section>

      {f.reason && <p className="text-center text-sm font-semibold text-lg-dim">{f.reason}</p>}
      <button type="button" disabled={!f.canSubmit} onClick={f.submit}
        className="h-14 w-full rounded-lg bg-lg-accent text-lg font-black text-lg-ink transition-transform active:scale-95 disabled:opacity-40">
        {f.isSubmitting ? 'Creando…' : 'Crear votación'}
      </button>
    </div>
  );
}
