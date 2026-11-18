import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useEventGoing } from '@/presentation/hooks/events/useEventGoing';

const svc = vi.hoisted(() => ({
  isAttending: vi.fn(),
  attendEvent: vi.fn(),
  cancelAttendance: vi.fn(),
  subscribe: vi.fn(),
}));
vi.mock('@lib/supabase/services/events', () => ({ eventsService: svc }));
vi.mock('@lib/supabase/services/events/attendanceLive', () => ({ subscribeAttendanceCount: svc.subscribe }));
vi.mock('react-hot-toast', () => ({ default: { error: vi.fn() } }));

describe('useEventGoing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.isAttending.mockResolvedValue(false);
    svc.subscribe.mockReturnValue(() => {});
  });

  it('parte del conteo inicial y detecta si ya voy', async () => {
    svc.isAttending.mockResolvedValue(true);
    const { result } = renderHook(() => useEventGoing('e1', 'u1', 12));
    await waitFor(() => expect(result.current.going).toBe(true));
    expect(result.current.count).toBe(12);
  });

  it('"Voy" suma de forma optimista y llama al servicio', async () => {
    svc.attendEvent.mockResolvedValue(undefined);
    const { result } = renderHook(() => useEventGoing('e1', 'u1', 12));
    await act(async () => { await result.current.toggle(); });
    expect(result.current.going).toBe(true);
    expect(result.current.count).toBe(13);
    expect(svc.attendEvent).toHaveBeenCalledWith('u1', 'e1');
  });

  it('segundo toque cancela', async () => {
    svc.attendEvent.mockResolvedValue(undefined);
    svc.cancelAttendance.mockResolvedValue(undefined);
    const { result } = renderHook(() => useEventGoing('e1', 'u1', 12));
    await act(async () => { await result.current.toggle(); });
    await act(async () => { await result.current.toggle(); });
    expect(result.current.going).toBe(false);
    expect(result.current.count).toBe(12);
    expect(svc.cancelAttendance).toHaveBeenCalledWith('u1', 'e1');
  });

  it('revierte si falla', async () => {
    svc.attendEvent.mockRejectedValue(new Error('rls'));
    const { result } = renderHook(() => useEventGoing('e1', 'u1', 12));
    await act(async () => { await result.current.toggle(); });
    expect(result.current.going).toBe(false);
    expect(result.current.count).toBe(12);
  });

  it('sin usuario no hace nada', async () => {
    const { result } = renderHook(() => useEventGoing('e1', undefined, 12));
    await act(async () => { await result.current.toggle(); });
    expect(svc.attendEvent).not.toHaveBeenCalled();
    expect(result.current.going).toBe(false);
  });

  it('el conteo en vivo reemplaza el valor local', async () => {
    let push: (n: number) => void = () => {};
    svc.subscribe.mockImplementation((_id: string, cb: (n: number) => void) => { push = cb; return () => {}; });
    const { result } = renderHook(() => useEventGoing('e1', 'u1', 12));
    act(() => push(20));
    expect(result.current.count).toBe(20);
  });
});
