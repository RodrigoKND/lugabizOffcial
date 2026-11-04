import { useState } from 'react';
import { Loader2, Search, Shield } from 'lucide-react';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import { useContentModeration } from '@presentation/hooks/admin/useContentModeration';
import { PAGE_SIZE, type ContentType } from '@lib/supabase/services/admin/adminContent';
import { Pager } from './_Pager';
import { ContentRow } from './_ContentRow';

const LABELS = { places: 'Lugares', events: 'Eventos', reviews: 'Reseñas' } as const;

// Moderación de lugares, eventos y reseñas: 20 por página desde el servidor, paginador y buscador arriba.
export function ContentModeration({ type }: { type: ContentType }) {
  const { items, total, totalPages, page, setPage, search, setSearch, loading, deleting, restoring, remove, restore } = useContentModeration(type);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="bg-lg-surface rounded-2xl border border-lg-surface-2 shadow-sm">
      <div className="p-5 border-b border-lg-surface-2 space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-lg-dim" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Buscar en ${LABELS[type]}...`}
            className="w-full pl-9 pr-4 py-2.5 bg-lg-surface-2 border border-lg-surface-2 rounded-xl text-sm text-lg-text focus:outline-none focus:border-lg-accent" />
        </div>
        <Pager page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onPage={setPage} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-lg-accent" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-lg-dim"><Shield className="w-10 h-10 mx-auto mb-3" /><p className="text-sm font-medium">No hay {LABELS[type].toLowerCase()} para mostrar</p></div>
      ) : (
        <ul className="divide-y divide-lg-surface-2">
          {items.map(item => (
            <ContentRow key={item.id} item={item} type={type} deleting={deleting === item.id} restoring={restoring === item.id}
              onDelete={setConfirmId} onRestore={restore} />
          ))}
        </ul>
      )}

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={() => { if (confirmId) remove(confirmId); }}
        title="Eliminar contenido" message="¿Eliminar este contenido? Esta acción no se puede deshacer." confirmLabel="Eliminar" variant="danger" />
    </div>
  );
}
