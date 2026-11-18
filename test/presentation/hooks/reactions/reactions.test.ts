import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PHRASES, pickPhrases } from '@/presentation/components/features/reactions/phrases';
import { useReactionBurst } from '@/presentation/hooks/reactions/useReactionBurst';

describe('pickPhrases', () => {
  it('devuelve frases distintas del catálogo', () => {
    const out = pickPhrases(4);
    expect(out).toHaveLength(4);
    expect(new Set(out).size).toBe(4);
    out.forEach(p => expect(PHRASES).toContain(p));
  });

  it('no pide más de las que existen', () => {
    expect(pickPhrases(999)).toHaveLength(PHRASES.length);
  });

  it('todas son cortas', () => {
    PHRASES.forEach(p => expect(p.length).toBeLessThanOrEqual(22));
  });
});

describe('useReactionBurst', () => {
  afterEach(() => vi.useRealTimers());

  it('agrega frases en el punto de origen', () => {
    const { result } = renderHook(() => useReactionBurst());
    act(() => result.current.fire({ x: 100, y: 200 }, 3));
    expect(result.current.items).toHaveLength(3);
    result.current.items.forEach(i => expect(i.top).toBe(200));
  });

  it('las frases desaparecen solas', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useReactionBurst());
    act(() => result.current.fire({ x: 0, y: 0 }, 3));
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.items).toHaveLength(0);
  });

  it('nunca acumula más del máximo aunque se toque sin parar', () => {
    const { result } = renderHook(() => useReactionBurst());
    for (let i = 0; i < 20; i++) act(() => result.current.fire({ x: 0, y: 0 }, 3));
    expect(result.current.items.length).toBeLessThanOrEqual(18);
  });

  it('limpia los temporizadores al desmontar', () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useReactionBurst());
    act(() => result.current.fire({ x: 0, y: 0 }, 3));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
