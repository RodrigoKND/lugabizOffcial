import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCoarsePointer } from '@/presentation/hooks/useCoarsePointer';

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
    matches, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
}
afterEach(() => { vi.unstubAllGlobals(); });

describe('useCoarsePointer', () => {
  it('es true en pantallas táctiles', () => {
    stubMatchMedia(true);
    expect(renderHook(() => useCoarsePointer()).result.current).toBe(true);
  });

  it('es false con mouse', () => {
    stubMatchMedia(false);
    expect(renderHook(() => useCoarsePointer()).result.current).toBe(false);
  });

  it('sin matchMedia no rompe y asume mouse', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(renderHook(() => useCoarsePointer()).result.current).toBe(false);
  });
});
