import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFeedbackInbox } from '@/presentation/hooks/admin/useFeedbackInbox';
import type { FeedbackItem } from '@/domain/entities/Feedback';

const svc = vi.hoisted(() => ({ list: vi.fn(), stats: vi.fn(), setStatus: vi.fn(), remove: vi.fn() }));
vi.mock('@lib/supabase/services/feedback/feedback', () => ({ feedbackService: svc }));
vi.mock('react-hot-toast', () => ({ default: { error: vi.fn() } }));

const item = (id: string, status: FeedbackItem['status'] = 'nuevo'): FeedbackItem => ({
  id, userId: 'u', type: 'idea', message: `msg ${id}`, status, createdAt: `2026-11-0${id}`,
});
const counts = { nuevo: 2, visto: 0, planeado: 0, hecho: 0, archivado: 0 };

beforeEach(() => {
  vi.clearAllMocks();
  svc.list.mockResolvedValue({ items: [item('2'), item('1')], nextCursor: null });
  svc.stats.mockResolvedValue({ ...counts });
});

describe('useFeedbackInbox', () => {
  it('carga la primera página y los conteos', async () => {
    const { result } = renderHook(() => useFeedbackInbox({ search: '' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.counts.nuevo).toBe(2);
    expect(result.current.hasMore).toBe(false);
  });

  it('carga más con el cursor y no duplica', async () => {
    svc.list.mockResolvedValueOnce({ items: [item('3'), item('2')], nextCursor: '2026-11-02' });
    svc.list.mockResolvedValueOnce({ items: [item('2'), item('1')], nextCursor: null });
    const { result } = renderHook(() => useFeedbackInbox({ search: '' }));
    await waitFor(() => expect(result.current.hasMore).toBe(true));
    await act(async () => { await result.current.loadMore(); });
    expect(svc.list).toHaveBeenLastCalledWith(expect.objectContaining({ cursor: '2026-11-02' }));
    expect(result.current.items.map(i => i.id)).toEqual(['3', '2', '1']);
    expect(result.current.hasMore).toBe(false);
  });

  it('al cambiar un filtro reinicia la lista', async () => {
    const { result, rerender } = renderHook(({ f }) => useFeedbackInbox(f), { initialProps: { f: { search: '' } as { search: string; type?: 'idea' } } });
    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender({ f: { search: '', type: 'idea' } });
    await waitFor(() => expect(svc.list).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'idea' })));
    expect(svc.list.mock.lastCall?.[0]).not.toHaveProperty('cursor');
  });

  it('cambia el estado de forma optimista y ajusta los conteos', async () => {
    svc.setStatus.mockResolvedValue(undefined);
    const { result } = renderHook(() => useFeedbackInbox({ search: '' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.changeStatus('1', 'hecho'); });
    expect(result.current.items.find(i => i.id === '1')?.status).toBe('hecho');
    expect(result.current.counts).toMatchObject({ nuevo: 1, hecho: 1 });
  });

  it('si hay filtro de estado, el elemento sale de la lista al cambiarlo', async () => {
    svc.setStatus.mockResolvedValue(undefined);
    const { result } = renderHook(() => useFeedbackInbox({ search: '', status: 'nuevo' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.changeStatus('1', 'visto'); });
    expect(result.current.items.map(i => i.id)).toEqual(['2']);
  });

  it('revierte items y conteos si falla', async () => {
    svc.setStatus.mockRejectedValue(new Error('rls'));
    const { result } = renderHook(() => useFeedbackInbox({ search: '' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.changeStatus('1', 'hecho'); });
    expect(result.current.items.find(i => i.id === '1')?.status).toBe('nuevo');
    expect(result.current.counts.nuevo).toBe(2);
  });

  it('borra de forma optimista y revierte si falla', async () => {
    svc.remove.mockRejectedValue(new Error('rls'));
    const { result } = renderHook(() => useFeedbackInbox({ search: '' }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.remove('1'); });
    expect(result.current.items).toHaveLength(2);
  });
});
