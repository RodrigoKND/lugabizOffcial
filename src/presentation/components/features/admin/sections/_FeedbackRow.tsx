import { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { FEEDBACK_STATUSES, FEEDBACK_TYPES, type FeedbackItem, type FeedbackStatus } from '@domain/entities/Feedback';

const LONG_MESSAGE = 160;

interface FeedbackRowProps {
  item: FeedbackItem;
  onStatus: (id: string, status: FeedbackStatus) => void;
  onDelete: (item: FeedbackItem) => void;
}

// Una opinión: quién, cuándo, el mensaje (colapsado si es largo), su estado y borrar.
export function FeedbackRow({ item, onStatus, onDelete }: FeedbackRowProps) {
  const [expanded, setExpanded] = useState(false);
  const long = item.message.length > LONG_MESSAGE;
  const typeLabel = FEEDBACK_TYPES.find(t => t.id === item.type)?.label;

  return (
    <li className="flex items-start gap-3 px-5 py-4 hover:bg-lg-surface-2 transition-colors">
      {item.userAvatar
        ? <img src={item.userAvatar} alt="" loading="lazy" className="w-9 h-9 rounded-full object-cover shrink-0" />
        : <span className="w-9 h-9 rounded-full bg-lg-surface-2 text-lg-accent text-sm font-bold flex items-center justify-center shrink-0">{(item.userName || '?').charAt(0).toUpperCase()}</span>}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-lg-text">{item.userName || 'Usuario'}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-lg-accent text-lg-ink">{typeLabel}</span>
          {item.rating && <span className="flex items-center gap-0.5 text-[11px] text-lg-dim"><Star className="w-3 h-3 fill-lg-accent text-lg-accent" />{item.rating}</span>}
          <span className="text-[11px] text-lg-dim">{new Date(item.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
          {item.page && <span className="text-[11px] text-lg-dim truncate max-w-[10rem]">en {item.page}</span>}
        </div>
        <p className={`text-sm text-lg-text mt-1 whitespace-pre-wrap break-words ${expanded ? '' : 'line-clamp-3'}`}>{item.message}</p>
        {long && (
          <button onClick={() => setExpanded(v => !v)} className="mt-1 text-xs font-semibold text-lg-accent hover:underline">
            {expanded ? 'Ver menos' : 'Ver más'}
          </button>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <select value={item.status} onChange={e => onStatus(item.id, e.target.value as FeedbackStatus)} aria-label="Estado"
          className="rounded-lg bg-lg-surface-2 text-lg-text text-xs font-semibold px-2 py-1.5 outline-none border border-lg-surface-2 focus:border-lg-accent">
          {FEEDBACK_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label.replace(/s$/, '')}</option>)}
        </select>
        <button onClick={() => onDelete(item)} aria-label="Borrar opinión"
          className="p-2 rounded-xl text-lg-dim hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 className="w-4 h-4" /></button>
      </div>
    </li>
  );
}
