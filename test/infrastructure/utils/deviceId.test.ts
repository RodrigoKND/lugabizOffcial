import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDeviceId } from '@/infrastructure/utils/deviceId';

// Almacenamiento falso: el localStorage real no es fiable entre entornos de test.
function fakeStorage(blocked = false) {
  const data = new Map<string, string>();
  const fail = () => { throw new Error('blocked'); };
  return {
    data,
    getItem: blocked ? fail : (k: string) => data.get(k) ?? null,
    setItem: blocked ? fail : (k: string, v: string) => { data.set(k, v); },
  };
}

describe('getDeviceId', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  describe('con almacenamiento disponible', () => {
    let storage: ReturnType<typeof fakeStorage>;
    beforeEach(() => { storage = fakeStorage(); vi.stubGlobal('localStorage', storage); });

    it('crea un id y lo guarda', () => {
      const id = getDeviceId();
      expect(id.length).toBeGreaterThanOrEqual(8);
      expect(storage.data.get('_lugabiz_d')).toBe(id);
    });

    it('reutiliza el id guardado', () => {
      storage.data.set('_lugabiz_d', 'device-existente');
      expect(getDeviceId()).toBe('device-existente');
    });
  });

  it('si el almacenamiento está bloqueado, igual devuelve un id estable', () => {
    vi.stubGlobal('localStorage', fakeStorage(true));
    const a = getDeviceId();
    expect(a.length).toBeGreaterThanOrEqual(8);
    expect(getDeviceId()).toBe(a);
  });
});
