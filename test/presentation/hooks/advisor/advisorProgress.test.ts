import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  progressKey, toggleDone, firstPending, loadDone, saveDone,
} from '@/presentation/hooks/advisor/advisorProgress';

function stubStorage(blocked = false) {
  const data = new Map<string, string>();
  const fail = () => { throw new Error('blocked'); };
  vi.stubGlobal('localStorage', {
    getItem: blocked ? fail : (k: string) => data.get(k) ?? null,
    setItem: blocked ? fail : (k: string, v: string) => { data.set(k, v); },
  });
}
afterEach(() => { vi.unstubAllGlobals(); });

describe('progressKey', () => {
  it('es estable y no distingue mayúsculas ni espacios de más', () => {
    const a = progressKey({ idea: ' Cafetería ', location: { lat: -17.39, lng: -66.157 } });
    const b = progressKey({ idea: 'cafetería', location: { lat: -17.39, lng: -66.157 } });
    expect(a).toBe(b);
  });

  it('cambia con la idea o con la zona', () => {
    const base = progressKey({ idea: 'café', location: { lat: -17.39, lng: -66.157 } });
    expect(progressKey({ idea: 'pizza', location: { lat: -17.39, lng: -66.157 } })).not.toBe(base);
    expect(progressKey({ idea: 'café', location: { lat: -17.5, lng: -66.2 } })).not.toBe(base);
  });

  it('sin idea ni coordenadas igual da una clave', () => {
    expect(progressKey({ idea: null, location: { lat: null, lng: null } }).length).toBeGreaterThan(0);
  });
});

describe('toggleDone / firstPending', () => {
  it('agrega y quita sin mutar la lista original', () => {
    const start = ['idea'];
    expect(toggleDone(start, 'market')).toEqual(['idea', 'market']);
    expect(toggleDone(['idea', 'market'], 'idea')).toEqual(['market']);
    expect(start).toEqual(['idea']);
  });

  it('la parada actual es la primera sin listo', () => {
    const order = ['idea', 'market', 'offer'];
    expect(firstPending(order, [])).toBe('idea');
    expect(firstPending(order, ['idea', 'offer'])).toBe('market');
    expect(firstPending(order, ['idea', 'market', 'offer'])).toBeUndefined();
  });
});

describe('almacenamiento', () => {
  it('guarda y restaura por clave', () => {
    stubStorage();
    saveDone('k1', ['idea', 'market']);
    expect(loadDone('k1')).toEqual(['idea', 'market']);
    expect(loadDone('otra')).toEqual([]);
  });

  it('ignora datos rotos o que no son una lista de textos', () => {
    stubStorage();
    localStorage.setItem('_lugabiz_ar:x', '{no json');
    expect(loadDone('x')).toEqual([]);
    localStorage.setItem('_lugabiz_ar:y', JSON.stringify([1, { a: 1 }, 'idea']));
    expect(loadDone('y')).toEqual(['idea']);
  });

  it('con el almacenamiento bloqueado no rompe', () => {
    stubStorage(true);
    expect(loadDone('k')).toEqual([]);
    expect(() => saveDone('k', ['idea'])).not.toThrow();
  });
});
