import { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Search, Vote } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import { useDebouncedValue } from '@presentation/hooks/useDebouncedValue';
import { pollBankService, type PollBankItem } from '@lib/supabase/services/chispa/pollBank';
import { laPazToday, validateSchedule, type PollInput } from '@lib/supabase/services/chispa/pollBankRules';
import { PollToday } from './_PollToday';
import { PollForm } from './_PollForm';
import { PollBankRow } from './_PollBankRow';

// Ta' pues del día: la pregunta se elige sola; aquí se administra el banco y se puede programar una fecha.
export function PollSection() {
  const [rows, setRows] = useState<PollBankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<PollBankItem | 'new' | null>(null);
  const [toDelete, setToDelete] = useState<PollBankItem | null>(null);
  const search = useDebouncedValue(query);
  const today = laPazToday();

  const load = useCallback(async () => {
    try { setRows(await pollBankService.list(search)); }
    catch { toast.error('No se pudo cargar el banco de preguntas'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const run = async (action: () => Promise<void>, ok: string) => {
    try { await action(); toast.success(ok); await load(); }
    catch { toast.error('No se pudo guardar el cambio'); }
  };

  const save = (input: PollInput) =>
    run(async () => {
      if (editing && editing !== 'new') await pollBankService.update(editing.id, input);
      else await pollBankService.create(input);
      setEditing(null);
    }, 'Pregunta guardada');

  const schedule = (id: number, date: string | null) => {
    if (date) {
      const problem = validateSchedule(date, today, rows.map(r => r.scheduledFor).filter((d): d is string => !!d));
      if (problem) { toast.error(problem); return; }
    }
    run(() => pollBankService.schedule(id, date), date ? 'Pregunta programada' : 'Programación quitada');
  };

  return (
    <div className="bg-lg-surface rounded-2xl border border-lg-surface-2 shadow-sm">
      <div className="p-5 border-b border-lg-surface-2 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-lg-surface-2 flex items-center justify-center"><Vote className="w-4 h-4 text-lg-accent" /></div>
        <div className="flex-1"><h3 className="font-bold text-lg-text">Ta' pues del día</h3><p className="text-[11px] text-lg-dim">Se elige sola cada día; programa una fecha si quieres decidir tú</p></div>
        <button onClick={() => setEditing('new')} className="flex items-center gap-1 rounded-full bg-lg-accent px-3.5 py-2 text-xs font-extrabold text-lg-ink hover:brightness-110">
          <Plus className="w-3.5 h-3.5" /> Nueva
        </button>
      </div>

      <PollToday />
      {editing && <PollForm key={editing === 'new' ? 'new' : editing.id} initial={editing === 'new' ? undefined : editing} onSubmit={save} onCancel={() => setEditing(null)} />}

      <div className="p-4 border-b border-lg-surface-2 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-lg-dim" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar en el banco..."
          className="w-full pl-8 pr-3 py-2 rounded-xl bg-lg-surface-2 text-sm text-lg-text outline-none border border-lg-surface-2 focus:border-lg-accent" />
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-lg-accent" /></div>
        : rows.length === 0 ? <p className="text-center py-12 text-sm text-lg-dim">{search ? 'Nada coincide' : 'El banco está vacío: agrega una pregunta'}</p>
        : <ul className="divide-y divide-lg-surface-2">
            {rows.map(r => <PollBankRow key={r.id} item={r} minDate={today} onSchedule={schedule} onEdit={setEditing} onDelete={setToDelete} />)}
          </ul>}

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)}
        onConfirm={() => { if (toDelete) run(() => pollBankService.remove(toDelete.id), 'Pregunta borrada'); }}
        title="Borrar pregunta" message={toDelete ? `¿Borrar "${toDelete.question}" del banco?` : ''}
        confirmLabel="Borrar" variant="danger" />
    </div>
  );
}
