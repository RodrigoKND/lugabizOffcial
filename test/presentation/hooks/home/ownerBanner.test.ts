import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  shouldShowOwnerBanner, readDismissedAt, saveDismissedAt, DISMISS_DAYS,
} from '@/presentation/hooks/home/ownerBanner';

const DAY = 86_400_000;
const NOW = 1_800_000_000_000;

function stubStorage(blocked = false) {
  const data = new Map<string, string>();
  const fail = () => { throw new Error('blocked'); };
  vi.stubGlobal('localStorage', {
    getItem: blocked ? fail : (k: string) => data.get(k) ?? null,
    setItem: blocked ? fail : (k: string, v: string) => { data.set(k, v); },
  });
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('shouldShowOwnerBanner', () => {
  it('no se muestra a los dueños', () => {
    expect(shouldShowOwnerBanner(true, null, NOW)).toBe(false);
  });

  it('se muestra a quien nunca lo cerró', () => {
    expect(shouldShowOwnerBanner(false, null, NOW)).toBe(true);
  });

  it('no vuelve antes de 14 días', () => {
    expect(shouldShowOwnerBanner(false, NOW - 3 * DAY, NOW)).toBe(false);
    expect(shouldShowOwnerBanner(false, NOW - (DISMISS_DAYS - 1) * DAY, NOW)).toBe(false);
  });

  it('vuelve pasados los 14 días', () => {
    expect(shouldShowOwnerBanner(false, NOW - (DISMISS_DAYS + 1) * DAY, NOW)).toBe(true);
  });
});

describe('almacenamiento del cierre', () => {
  it('guarda y lee la fecha', () => {
    stubStorage();
    saveDismissedAt(NOW);
    expect(readDismissedAt()).toBe(NOW);
  });

  it('sin nada guardado o con un valor roto devuelve null', () => {
    stubStorage();
    expect(readDismissedAt()).toBeNull();
    localStorage.setItem('_lugabiz_ob', 'no-es-numero');
    expect(readDismissedAt()).toBeNull();
  });

  it('con el almacenamiento bloqueado no rompe', () => {
    stubStorage(true);
    expect(readDismissedAt()).toBeNull();
    expect(() => saveDismissedAt(NOW)).not.toThrow();
  });
});
