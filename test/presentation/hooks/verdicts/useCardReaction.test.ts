import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCardReaction } from '@/presentation/hooks/verdicts/useCardReaction';

const svc = vi.hoisted(() => ({ load: vi.fn(), cast: vi.fn() }));
vi.mock('@lib/supabase/services/verdicts/verdicts', () => ({ verdictsService: svc }));
vi.mock('@presentation/context', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }));
vi.mock('react-hot-toast', () => ({ default: Object.assign(vi.fn(), { error: vi.fn() }) }));

const origin = { x: 10, y: 20 };

describe('useCardReaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.load.mockResolvedValue({ counts: { jallalla: 3, bien: 0, ahi: 0 }, mine: null });
    svc.cast.mockResolvedValue(undefined);
  });

  it('reaccionar vota y lanza las frases flotantes desde el punto tocado', async () => {
    const { result } = renderHook(() => useCardReaction('place', 'p1'));
    await waitFor(() => expect(result.current.counts.jallalla).toBe(3));
    await act(async () => { result.current.react('jallalla', origin); });
    expect(svc.cast).toHaveBeenCalledWith('place', 'p1', 'jallalla');
    expect(result.current.mine).toBe('jallalla');
    expect(result.current.burstItems.length).toBeGreaterThan(0);
  });

  it('quitar el voto no lanza frases', async () => {
    const { result } = renderHook(() => useCardReaction('place', 'p1'));
    await waitFor(() => expect(result.current.counts.jallalla).toBe(3));
    await act(async () => { result.current.react('jallalla', origin); });
    const before = result.current.burstItems.length;
    await act(async () => { result.current.react('jallalla', origin); });
    expect(result.current.mine).toBeNull();
    expect(result.current.burstItems.length).toBe(before);
  });

  it('sin id no pide conteos ni vota', async () => {
    const { result } = renderHook(() => useCardReaction('place', undefined));
    await act(async () => { result.current.react('jallalla', origin); });
    expect(svc.load).not.toHaveBeenCalled();
    expect(svc.cast).not.toHaveBeenCalled();
  });
});
