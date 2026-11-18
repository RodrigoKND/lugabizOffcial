import { describe, it, expect, vi, afterEach } from 'vitest';
import { safeUuid } from '@/infrastructure/utils/uuid';
import { installChunkRecovery } from '@/infrastructure/utils/chunkRecovery';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('safeUuid', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('usa crypto.randomUUID cuando existe', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'fijo-123' });
    expect(safeUuid()).toBe('fijo-123');
  });

  it('sin randomUUID (iOS < 15.4 o sin HTTPS) arma un UUID v4 con getRandomValues', () => {
    vi.stubGlobal('crypto', { getRandomValues: (a: Uint8Array) => a.map((_, i) => (i * 17) % 256) });
    expect(safeUuid()).toMatch(UUID_V4);
  });

  it('sin crypto en absoluto sigue devolviendo un UUID v4 válido y distinto', () => {
    vi.stubGlobal('crypto', undefined);
    const a = safeUuid(), b = safeUuid();
    expect(a).toMatch(UUID_V4);
    expect(a).not.toBe(b);
  });
});

function fakeWin(storageThrows = false) {
  const store = new Map<string, string>();
  let handler: (e: Event) => void = () => {};
  const win = {
    addEventListener: (_: string, f: (e: Event) => void) => { handler = f; },
    sessionStorage: {
      getItem: (k: string) => { if (storageThrows) throw new Error('blocked'); return store.get(k) ?? null; },
      setItem: (k: string, v: string) => { if (storageThrows) throw new Error('blocked'); store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); },
    },
    setTimeout: (f: () => void, ms: number) => setTimeout(f, ms),
  } as unknown as Window;
  const fire = () => { const e = new Event('vite:preloadError', { cancelable: true }); handler(e); return e; };
  return { win, fire };
}

describe('installChunkRecovery', () => {
  afterEach(() => vi.useRealTimers());

  it('recarga una vez cuando falla la carga de un archivo', () => {
    const { win, fire } = fakeWin();
    const reload = vi.fn();
    installChunkRecovery(win, reload);
    const e = fire();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(e.defaultPrevented).toBe(true);
  });

  it('no entra en bucle: el segundo fallo seguido deja pasar el error al ErrorBoundary', () => {
    const { win, fire } = fakeWin();
    const reload = vi.fn();
    installChunkRecovery(win, reload);
    fire();
    const second = fire();
    expect(reload).toHaveBeenCalledTimes(1);
    expect(second.defaultPrevented).toBe(false);
  });

  it('si la página cargó bien (10 s), permite recargar en un despliegue futuro', () => {
    vi.useFakeTimers();
    const { win, fire } = fakeWin();
    const reload = vi.fn();
    installChunkRecovery(win, reload);
    fire();
    vi.advanceTimersByTime(10_000);
    fire();
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it('si el almacenamiento está bloqueado no recarga (evita bucles) y no rompe', () => {
    const { win, fire } = fakeWin(true);
    const reload = vi.fn();
    installChunkRecovery(win, reload);
    expect(() => fire()).not.toThrow();
    expect(reload).not.toHaveBeenCalled();
  });
});
