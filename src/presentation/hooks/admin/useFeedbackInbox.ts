import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { feedbackService } from '@lib/supabase/services/feedback/feedback';
import type { FeedbackCounts, FeedbackItem, FeedbackStatus, FeedbackType } from '@domain/entities/Feedback';

export interface InboxFilters {
  status?: FeedbackStatus;
  type?: FeedbackType;
  search: string;
}

const EMPTY_COUNTS: FeedbackCounts = { nuevo: 0, visto: 0, planeado: 0, hecho: 0, archivado: 0 };

// Bandeja de opiniones: paginada por cursor, con filtros en servidor y cambios optimistas.
export function useFeedbackInbox(filters: InboxFilters) {
  const { status, type, search } = filters;
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [counts, setCounts] = useState<FeedbackCounts>(EMPTY_COUNTS);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // Evita que una respuesta lenta de un filtro viejo pise la del filtro actual.
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setItems([]);
    feedbackService.list({ status, type, search })
      .then(page => { if (id === requestId.current) { setItems(page.items); setCursor(page.nextCursor); } })
      .catch(() => { if (id === requestId.current) toast.error('No se pudieron cargar las opiniones'); })
      .finally(() => { if (id === requestId.current) setLoading(false); });
  }, [status, type, search]);

  useEffect(() => { feedbackService.stats().then(setCounts).catch(() => {}); }, []);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await feedbackService.list({ status, type, search, cursor });
      setItems(prev => [...prev, ...page.items.filter(n => !prev.some(p => p.id === n.id))]);
      setCursor(page.nextCursor);
    } catch { toast.error('No se pudieron cargar más'); }
    finally { setLoadingMore(false); }
  }, [cursor, loadingMore, status, type, search]);

  const changeStatus = useCallback(async (id: string, next: FeedbackStatus) => {
    const current = items.find(i => i.id === id);
    if (!current || current.status === next) return;
    const prevItems = items, prevCounts = counts;
    setItems(status && status !== next ? items.filter(i => i.id !== id) : items.map(i => (i.id === id ? { ...i, status: next } : i)));
    setCounts({ ...counts, [current.status]: counts[current.status] - 1, [next]: counts[next] + 1 });
    try { await feedbackService.setStatus(id, next); }
    catch { setItems(prevItems); setCounts(prevCounts); toast.error('No se pudo cambiar el estado'); }
  }, [items, counts, status]);

  const remove = useCallback(async (id: string) => {
    const current = items.find(i => i.id === id);
    if (!current) return;
    const prevItems = items, prevCounts = counts;
    setItems(items.filter(i => i.id !== id));
    setCounts({ ...counts, [current.status]: counts[current.status] - 1 });
    try { await feedbackService.remove(id); }
    catch { setItems(prevItems); setCounts(prevCounts); toast.error('No se pudo borrar'); }
  }, [items, counts]);

  return { items, counts, loading, loadingMore, hasMore: cursor !== null, loadMore, changeStatus, remove };
}
