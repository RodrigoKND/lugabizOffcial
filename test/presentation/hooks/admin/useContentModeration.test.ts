import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useContentModeration } from '@/presentation/hooks/admin/useContentModeration';

const svc = vi.hoisted(() => ({ list: vi.fn() }));
const admin = vi.hoisted(() => ({ deletePlace: vi.fn(), deleteEvent: vi.fn(), deleteReview: vi.fn() }));
vi.mock('@lib/supabase/services/admin/adminContent', () => ({ adminContentService: svc, PAGE_SIZE: 20 }));
vi.mock('@lib/supabase/services/admin/admin', () => ({ adminService: admin }));
vi.mock('@lib/supabase', () => ({ placeFakeReportsService: { restore: vi.fn() } }));
vi.mock('react-hot-toast', () => ({ default: { error: vi.fn(), success: vi.fn() } }));

const item = (id: string) => ({ id, name: `n${id}`, created_at: '2026-11-01' });

beforeEach(() => {
  vi.clearAllMocks();
  svc.list.mockResolvedValue({ items: [item('1'), item('2')], total: 45 });
});

describe('useContentModeration', () => {
  it('carga la primera página y calcula el total de páginas', async () => {
    const { result } = renderHook(() => useContentModeration('events'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(svc.list).toHaveBeenCalledWith('events', { page: 1, search: '' });
    expect(result.current.total).toBe(45);
    expect(result.current.totalPages).toBe(3);
  });

  it('cambiar de página pide esa página', async () => {
    const { result } = renderHook(() => useContentModeration('events'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setPage(2));
    await waitFor(() => expect(svc.list).toHaveBeenLastCalledWith('events', { page: 2, search: '' }));
  });

  it('al buscar vuelve a la página 1', async () => {
    const { result } = renderHook(() => useContentModeration('places'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setPage(3));
    await waitFor(() => expect(svc.list).toHaveBeenLastCalledWith('places', { page: 3, search: '' }));
    act(() => result.current.setSearch('cafe'));
    expect(result.current.page).toBe(1);
  });

  it('eliminar llama al servicio correcto y recarga la página desde el servidor', async () => {
    admin.deleteEvent.mockResolvedValue(undefined);
    const { result } = renderHook(() => useContentModeration('events'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    svc.list.mockClear();
    await act(async () => { await result.current.remove('1'); });
    expect(admin.deleteEvent).toHaveBeenCalledWith('1');
    expect(svc.list).toHaveBeenCalled();
  });

  it('si borrar el último de una página posterior la deja vacía, retrocede una página', async () => {
    admin.deletePlace.mockResolvedValue(undefined);
    svc.list.mockResolvedValue({ items: [item('9')], total: 21 });
    const { result } = renderHook(() => useContentModeration('places'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setPage(2));
    await waitFor(() => expect(result.current.page).toBe(2));
    svc.list.mockResolvedValue({ items: [], total: 20 });
    await act(async () => { await result.current.remove('9'); });
    await waitFor(() => expect(result.current.page).toBe(1));
  });
});
