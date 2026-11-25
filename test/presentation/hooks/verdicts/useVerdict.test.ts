import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useVerdict } from '@/presentation/hooks/verdicts/useVerdict';
import { applyVote } from '@/presentation/hooks/verdicts/verdictMath';
import type { VerdictSummary } from '@domain/entities';

const svc = vi.hoisted(() => ({ load: vi.fn(), cast: vi.fn() }));
const toastMock = vi.hoisted(() => Object.assign(vi.fn(), { error: vi.fn() }));
vi.mock('@lib/supabase/services/verdicts/verdicts', () => ({ verdictsService: svc }));
vi.mock('react-hot-toast', () => ({ default: toastMock }));

const base: VerdictSummary = { counts: { jallalla: 4, bien: 2, ahi: 1 }, mine: null };

function stubStorage() {
  const data = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => { data.set(k, v); },
  });
}

describe('applyVote', () => {
  it('suma el voto nuevo', () => {
    expect(applyVote(base, 'bien')).toEqual({ counts: { jallalla: 4, bien: 3, ahi: 1 }, mine: 'bien' });
  });

  it('cambiar de voto resta el anterior', () => {
    const voted: VerdictSummary = { counts: { jallalla: 4, bien: 2, ahi: 1 }, mine: 'jallalla' };
    expect(applyVote(voted, 'ahi')).toEqual({ counts: { jallalla: 3, bien: 2, ahi: 2 }, mine: 'ahi' });
  });

  it('quitar el voto resta y deja mine en null', () => {
    const voted: VerdictSummary = { counts: { jallalla: 4, bien: 2, ahi: 1 }, mine: 'jallalla' };
    expect(applyVote(voted, null)).toEqual({ counts: { jallalla: 3, bien: 2, ahi: 1 }, mine: null });
  });

  it('nunca baja de cero', () => {
    const odd: VerdictSummary = { counts: { jallalla: 0, bien: 0, ahi: 0 }, mine: 'bien' };
    expect(applyVote(odd, null).counts.bien).toBe(0);
  });
});

describe('useVerdict', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubStorage();
    svc.load.mockResolvedValue(base);
    svc.cast.mockResolvedValue(undefined);
  });
  afterEach(() => { vi.unstubAllGlobals(); });

  it('carga los conteos del cartel', async () => {
    const { result } = renderHook(() => useVerdict('place', 'p1', 'u1'));
    await waitFor(() => expect(result.current.counts.jallalla).toBe(4));
    expect(svc.load).toHaveBeenCalledWith('place', 'p1');
  });

  it('votar suma al instante y llama al servicio', async () => {
    const { result } = renderHook(() => useVerdict('place', 'p1', 'u1'));
    await waitFor(() => expect(result.current.counts.jallalla).toBe(4));
    await act(async () => { await result.current.vote('jallalla'); });
    expect(result.current.mine).toBe('jallalla');
    expect(result.current.counts.jallalla).toBe(5);
    expect(svc.cast).toHaveBeenCalledWith('place', 'p1', 'jallalla');
  });

  it('tocar el mismo veredicto otra vez quita el voto', async () => {
    const { result } = renderHook(() => useVerdict('event', 'e1', 'u1'));
    await waitFor(() => expect(result.current.counts.jallalla).toBe(4));
    await act(async () => { await result.current.vote('bien'); });
    await act(async () => { await result.current.vote('bien'); });
    expect(result.current.mine).toBeNull();
    expect(result.current.counts.bien).toBe(2);
    expect(svc.cast).toHaveBeenLastCalledWith('event', 'e1', null);
  });

  it('si falla, revierte y avisa', async () => {
    svc.cast.mockRejectedValue(new Error('rpc'));
    const { result } = renderHook(() => useVerdict('place', 'p1', 'u1'));
    await waitFor(() => expect(result.current.counts.jallalla).toBe(4));
    await act(async () => { await result.current.vote('ahi'); });
    expect(result.current.mine).toBeNull();
    expect(result.current.counts.ahi).toBe(1);
    expect(toastMock.error).toHaveBeenCalled();
  });

  it('sin sesión invita a iniciar sesión solo la primera vez', async () => {
    const { result } = renderHook(() => useVerdict('place', 'p1', undefined));
    await waitFor(() => expect(result.current.counts.jallalla).toBe(4));
    await act(async () => { await result.current.vote('bien'); });
    await act(async () => { await result.current.vote('ahi'); });
    expect(toastMock).toHaveBeenCalledTimes(1);
  });

  it('con sesión no muestra la invitación', async () => {
    const { result } = renderHook(() => useVerdict('place', 'p1', 'u1'));
    await waitFor(() => expect(result.current.counts.jallalla).toBe(4));
    await act(async () => { await result.current.vote('bien'); });
    expect(toastMock).not.toHaveBeenCalled();
  });

  it('una carga tardía no pisa un voto que ya hice', async () => {
    let resolveLoad: (s: VerdictSummary) => void = () => {};
    svc.load.mockReturnValue(new Promise<VerdictSummary>(r => { resolveLoad = r; }));
    const { result } = renderHook(() => useVerdict('place', 'p1', 'u1'));
    await act(async () => { await result.current.vote('jallalla'); });
    await act(async () => { resolveLoad(base); });
    expect(result.current.mine).toBe('jallalla');
  });
});
