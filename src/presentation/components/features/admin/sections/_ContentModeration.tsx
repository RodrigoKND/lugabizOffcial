import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@lib/supabase/services/admin/admin';
import { Search, Shield, Loader2, Trash2, Clock, Users, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import { timeAgo } from '../helpers';

interface ContentItem {
  id: string;
  name?: string;
  title?: string;
  comment?: string;
  description?: string;
  image?: string;
  user_name?: string;
  user_avatar?: string;
  rating?: number;
  created_at: string;
}

export function ContentModeration({ type }: { type: 'places' | 'events' | 'reviews' }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try { setItems(type === 'places' ? await adminService.getAllPlaces() : type === 'events' ? await adminService.getAllEvents() : await adminService.getAllReviews()); }
    catch { toast.error('Error al cargar datos'); } finally { setLoading(false); }
  }, [type]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      if (type === 'places') await adminService.deletePlace(id);
      else if (type === 'events') await adminService.deleteEvent(id);
      else await adminService.deleteReview(id);
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('Contenido eliminado');
    } catch { toast.error('Error al eliminar'); } finally { setDeleting(null); }
  };

  const q = search.toLowerCase();
  const filtered = items.filter(i => !search || (i.name || i.title || i.comment || '').toLowerCase().includes(q));
  const labels = { places: 'Lugares', events: 'Eventos', reviews: 'Reseñas' };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary-500" /></div>;

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
      <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Buscar en ${labels[type]}...`}
            className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10" />
        </div>
        <span className="px-2.5 py-1 bg-stone-100 rounded-full text-xs text-stone-400 font-medium">{filtered.length} / {items.length}</span>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400"><Shield className="w-10 h-10 mx-auto mb-3 text-stone-200" /><p className="text-sm font-medium">No hay {labels[type].toLowerCase()} para mostrar</p></div>
      ) : (
        <div className="divide-y divide-stone-50 max-h-[60vh] overflow-y-auto">
          {filtered.map((item) => (
            type === 'places' ? (
              <div key={item.id} className="flex gap-4 px-5 py-4 hover:bg-stone-50 transition-colors">
                <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><MapPin className="w-5 h-5 text-stone-300" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800 truncate">{item.name || 'Sin nombre'}</p>
                  {item.description && <p className="text-xs text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-stone-200 overflow-hidden shrink-0">
                        {item.user_avatar ? <img src={item.user_avatar} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Users className="w-2.5 h-2.5 text-stone-400" /></div>}
                      </div>
                      <span className="text-[11px] font-medium text-stone-600">{item.user_name || 'Usuario'}</span>
                    </div>
                    <span className="text-stone-300 text-[10px]">·</span>
                    <div className="flex items-center gap-1 text-[11px] text-stone-400">
                      <Clock className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleString('es', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <button onClick={() => setConfirmDeleteId(item.id)} disabled={deleting === item.id}
                  className="p-2 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50 shrink-0 self-start mt-1">
                  {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">{item.name || item.title || (item.comment?.slice(0, 60) + '…') || 'Sin título'}</p>
                  <p className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3" />{timeAgo(item.created_at)}
                    {item.user_name && <><span>·</span>{item.user_name}</>}
                    {item.rating && <><span>·</span>★ {item.rating}</>}
                  </p>
                </div>
                <button onClick={() => setConfirmDeleteId(item.id)} disabled={deleting === item.id}
                  className="p-2 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50">
                  {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            )
          ))}
        </div>
      )}
      <ConfirmDialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} onConfirm={() => { if (confirmDeleteId) handleDelete(confirmDeleteId); }}
        title="Eliminar contenido" message="¿Eliminar este contenido? Esta acción no se puede deshacer." confirmLabel="Eliminar" variant="danger" />
    </div>
  );
}
