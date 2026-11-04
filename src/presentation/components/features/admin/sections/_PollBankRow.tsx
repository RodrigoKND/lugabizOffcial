import { CalendarClock, Pencil, Trash2, X } from 'lucide-react';
import type { PollBankItem } from '@lib/supabase/services/chispa/pollBank';

interface PollBankRowProps {
  item: PollBankItem;
  minDate: string;
  onSchedule: (id: number, date: string | null) => void;
  onEdit: (item: PollBankItem) => void;
  onDelete: (item: PollBankItem) => void;
}

const fmt = (iso: string) => new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' });

// Una pregunta del banco: sus opciones, cuándo se usó o se programó, y sus acciones.
export function PollBankRow({ item, minDate, onSchedule, onEdit, onDelete }: PollBankRowProps) {
  return (
    <li className="flex items-center gap-3 px-5 py-3.5 hover:bg-lg-surface-2 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-lg-text truncate">{item.question}</p>
        <p className="text-[11px] text-lg-dim truncate">
          {item.optionA} · {item.optionB}
          {item.lastUsedAt && <> · usada el {fmt(item.lastUsedAt)}</>}
        </p>
      </div>
      {item.scheduledFor ? (
        <button onClick={() => onSchedule(item.id, null)} title="Quitar programación"
          className="flex items-center gap-1 rounded-full bg-lg-accent px-2.5 py-1 text-[11px] font-bold text-lg-ink">
          <CalendarClock className="w-3 h-3" />{fmt(`${item.scheduledFor}T12:00:00`)}<X className="w-3 h-3" />
        </button>
      ) : (
        <input type="date" min={minDate} aria-label="Programar para el día" onChange={e => e.target.value && onSchedule(item.id, e.target.value)}
          className="w-[7.5rem] rounded-lg bg-lg-surface-2 text-lg-text text-[11px] px-2 py-1 outline-none border border-lg-surface-2 focus:border-lg-accent" />
      )}
      <button onClick={() => onEdit(item)} aria-label="Editar" className="p-2 rounded-xl text-lg-dim hover:text-lg-text hover:bg-lg-surface-2"><Pencil className="w-4 h-4" /></button>
      <button onClick={() => onDelete(item)} aria-label="Borrar" className="p-2 rounded-xl text-lg-dim hover:text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
    </li>
  );
}
