import { useState } from 'react';
import toast from 'react-hot-toast';
import { validatePollInput, type PollInput } from '@lib/supabase/services/chispa/pollBankRules';

interface PollFormProps {
  initial?: PollInput;
  onSubmit: (input: PollInput) => Promise<void>;
  onCancel: () => void;
}

const FIELD = 'w-full rounded-xl bg-lg-surface-2 text-sm text-lg-text px-3 py-2 outline-none border border-lg-surface-2 focus:border-lg-accent';

// Crear o editar una pregunta del banco: pregunta + dos opciones.
export function PollForm({ initial, onSubmit, onCancel }: PollFormProps) {
  const [form, setForm] = useState<PollInput>(initial ?? { question: '', optionA: '', optionB: '' });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof PollInput) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = validatePollInput(form);
    if (problem) { toast.error(problem); return; }
    setSaving(true);
    try { await onSubmit(form); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="p-5 space-y-3 border-b border-lg-surface-2 bg-lg-ground/40">
      <input value={form.question} onChange={set('question')} placeholder="¿Silpancho o pique macho?" maxLength={100} className={FIELD} aria-label="Pregunta" />
      <div className="grid grid-cols-2 gap-3">
        <input value={form.optionA} onChange={set('optionA')} placeholder="Opción A" maxLength={30} className={FIELD} aria-label="Opción A" />
        <input value={form.optionB} onChange={set('optionB')} placeholder="Opción B" maxLength={30} className={FIELD} aria-label="Opción B" />
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="rounded-full px-4 py-2 text-sm font-semibold text-lg-dim hover:text-lg-text">Cancelar</button>
        <button type="submit" disabled={saving} className="rounded-full bg-lg-accent px-5 py-2 text-sm font-extrabold text-lg-ink hover:brightness-110 disabled:opacity-60">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
