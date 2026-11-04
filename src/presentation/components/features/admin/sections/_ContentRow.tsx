import { AlertTriangle, Calendar, Clock, Loader2, MapPin, RotateCcw, Star, Trash2, Users } from 'lucide-react';
import type { ContentItem, ContentType } from '@lib/supabase/services/admin/adminContent';

interface ContentRowProps {
  item: ContentItem;
  type: ContentType;
  deleting: boolean;
  restoring: boolean;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

const FALLBACK_ICON = { places: MapPin, events: Calendar, reviews: Users } as const;
const fmt = (iso: string, withTime = false) =>
  new Date(iso).toLocaleString('es', { day: 'numeric', month: 'short', year: 'numeric', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}) });

// Una fila de moderación para lugar, evento o reseña. Lugares y eventos llevan miniatura.
export function ContentRow({ item, type, deleting, restoring, onDelete, onRestore }: ContentRowProps) {
  const Fallback = FALLBACK_ICON[type];
  const title = item.name || item.comment?.slice(0, 60) || 'Sin título';
  const body = type === 'reviews' ? item.comment : item.description;

  return (
    <li className="flex gap-4 px-5 py-4 hover:bg-lg-surface-2 transition-colors">
      {type !== 'reviews' && (
        <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-lg-surface-2 border border-lg-surface-2">
          {item.image
            ? <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><Fallback className="w-5 h-5 text-lg-dim" /></div>}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-lg-text truncate">{title}</p>
          {item.hidden && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-[10px] font-semibold shrink-0">
              <AlertTriangle className="w-3 h-3" /> Oculto
            </span>
          )}
        </div>
        {body && <p className="text-xs text-lg-dim mt-0.5 line-clamp-2 leading-relaxed">{body}</p>}
        <div className="flex items-center gap-x-2 gap-y-1 mt-1.5 flex-wrap text-[11px] text-lg-dim">
          <span className="w-5 h-5 rounded-full bg-lg-surface-2 overflow-hidden flex items-center justify-center shrink-0">
            {item.user_avatar ? <img src={item.user_avatar} alt="" className="w-full h-full object-cover" /> : <Users className="w-2.5 h-2.5" />}
          </span>
          <span className="font-medium">{item.user_name}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmt(item.created_at, true)}</span>
          {item.date_start && <><span>·</span><span className="flex items-center gap-1 text-lg-accent font-semibold"><Calendar className="w-3 h-3" />{fmt(`${item.date_start}T12:00:00`)}</span></>}
          {item.rating && <><span>·</span><span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-lg-accent text-lg-accent" />{item.rating}</span></>}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 self-start mt-1">
        {item.hidden && (
          <button onClick={() => onRestore(item.id)} disabled={restoring} aria-label="Restaurar lugar"
            className="p-2 rounded-xl text-lg-dim hover:text-green-600 hover:bg-green-50 transition-all disabled:opacity-50">
            {restoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
          </button>
        )}
        <button onClick={() => onDelete(item.id)} disabled={deleting} aria-label="Eliminar"
          className="p-2 rounded-xl text-lg-dim hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50">
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
    </li>
  );
}
