import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '@lib/supabase/services/admin/admin';
import { adminContentService, PAGE_SIZE, type ContentItem, type ContentType } from '@lib/supabase/services/admin/adminContent';
import { placeFakeReportsService } from '@lib/supabase';
import { totalPagesFor } from '@presentation/components/features/admin/pagination';
import { useDebouncedValue } from '@presentation/hooks/useDebouncedValue';

const DELETE = { places: 'deletePlace', events: 'deleteEvent', reviews: 'deleteReview' } as const;

// Moderación paginada: una página a la vez desde el servidor, búsqueda con debounce y recarga tras borrar.
export function useContentModeration(type: ContentType) {
  const [page, setPage] = useState(1);
  const [search, setSearchState] = useState('');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);
  const debounced = useDebouncedValue(search);
  // Evita que una respuesta lenta de una página/búsqueda vieja pise la actual.
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    adminContentService.list(type, { page, search: debounced })
      .then(r => { if (id === requestId.current) { setItems(r.items); setTotal(r.total); } })
      .catch(() => { if (id === requestId.current) toast.error('Error al cargar datos'); })
      .finally(() => { if (id === requestId.current) setLoading(false); });
  }, [type, page, debounced, version]);

  const setSearch = useCallback((value: string) => { setSearchState(value); setPage(1); }, []);

  const remove = useCallback(async (id: string) => {
    setDeleting(id);
    try {
      await adminService[DELETE[type]](id);
      toast.success('Contenido eliminado');
      // Si era el último de esta página, se vuelve a la anterior; si no, se recarga la actual.
      if (items.length === 1 && page > 1) setPage(page - 1);
      else setVersion(v => v + 1);
    } catch { toast.error('Error al eliminar'); }
    finally { setDeleting(null); }
  }, [type, items.length, page]);

  const restore = useCallback(async (id: string) => {
    setRestoring(id);
    try {
      await placeFakeReportsService.restore(id);
      setItems(prev => prev.map(i => (i.id === id ? { ...i, hidden: false } : i)));
      toast.success('Lugar restaurado');
    } catch { toast.error('Solo un admin puede restaurar'); }
    finally { setRestoring(null); }
  }, []);

  return { items, total, totalPages: totalPagesFor(total, PAGE_SIZE), page, setPage, search, setSearch, loading, deleting, restoring, remove, restore };
}
