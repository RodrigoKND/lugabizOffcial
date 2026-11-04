import { useState } from 'react';
import { Lightbulb, Loader2, Search } from 'lucide-react';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import { useFeedbackInbox } from '@presentation/hooks/admin/useFeedbackInbox';
import { useDebouncedValue } from '@presentation/hooks/useDebouncedValue';
import { FEEDBACK_STATUSES, FEEDBACK_TYPES, type FeedbackItem, type FeedbackStatus, type FeedbackType } from '@domain/entities/Feedback';
import { FeedbackRow } from './_FeedbackRow';

// Bandeja de opiniones: filtros y búsqueda en servidor, 20 por página con "Cargar más".
export function FeedbackSection() {
  const [status, setStatus] = useState<FeedbackStatus | undefined>('nuevo');
  const [type, setType] = useState<FeedbackType | undefined>();
  const [query, setQuery] = useState('');
  const [toDelete, setToDelete] = useState<FeedbackItem | null>(null);
  const search = useDebouncedValue(query);
  const { items, counts, loading, loadingMore, hasMore, loadMore, changeStatus, remove } = useFeedbackInbox({ status, type, search });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const tab = (id: FeedbackStatus | undefined, label: string, n: number) => (
    <button key={label} onClick={() => setStatus(id)} aria-pressed={status === id}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${status === id ? 'bg-lg-accent text-lg-ink' : 'bg-lg-surface-2 text-lg-dim hover:text-lg-text'}`}>
      {label} <span className="opacity-70">{n}</span>
    </button>
  );

  return (
    <div className="bg-lg-surface rounded-2xl border border-lg-surface-2 shadow-sm">
      <div className="p-5 border-b border-lg-surface-2 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-lg-surface-2 flex items-center justify-center"><Lightbulb className="w-4 h-4 text-lg-accent" /></div>
          <div><h3 className="font-bold text-lg-text">Opiniones</h3><p className="text-[11px] text-lg-dim">{total} en total · lo que los usuarios quieren mejorar</p></div>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {tab(undefined, 'Todas', total)}
          {FEEDBACK_STATUSES.map(s => tab(s.id, s.label, counts[s.id]))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-lg-dim" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar en los mensajes..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-lg-surface-2 text-sm text-lg-text outline-none border border-lg-surface-2 focus:border-lg-accent" />
          </div>
          <select value={type ?? ''} onChange={e => setType((e.target.value || undefined) as FeedbackType | undefined)} aria-label="Tipo"
            className="rounded-xl bg-lg-surface-2 text-sm text-lg-text px-3 py-2 outline-none border border-lg-surface-2 focus:border-lg-accent">
            <option value="">Todos los tipos</option>
            {FEEDBACK_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-lg-accent" /></div>
      ) : items.length === 0 ? (
        <p className="text-center py-16 text-sm text-lg-dim">{search || type ? 'Nada coincide con ese filtro' : 'No hay opiniones en esta bandeja'}</p>
      ) : (
        <ul className="divide-y divide-lg-surface-2">
          {items.map(item => <FeedbackRow key={item.id} item={item} onStatus={changeStatus} onDelete={setToDelete} />)}
        </ul>
      )}

      {hasMore && !loading && (
        <div className="p-4 border-t border-lg-surface-2 text-center">
          <button onClick={loadMore} disabled={loadingMore}
            className="rounded-full bg-lg-surface-2 px-5 py-2 text-sm font-bold text-lg-text hover:bg-lg-accent hover:text-lg-ink transition-colors disabled:opacity-60">
            {loadingMore ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)}
        onConfirm={() => { if (toDelete) remove(toDelete.id); }}
        title="Borrar opinión" message="Se borra para siempre. Si solo quieres sacarla de la bandeja, archívala."
        confirmLabel="Borrar" variant="danger" />
    </div>
  );
}
