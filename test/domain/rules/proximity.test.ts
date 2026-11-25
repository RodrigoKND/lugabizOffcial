import { describe, it, expect } from 'vitest';
import { haversineMeters, placesWithin, isCoolingDown, isPreciseEnough } from '@domain/rules/proximity';

describe('haversineMeters', () => {
  it('el mismo punto está a 0 m', () => {
    expect(haversineMeters(-17.3935, -66.157, -17.3935, -66.157)).toBe(0);
  });

  it('mide distancias reales de Cochabamba (≈ 584 m por 0.0055° de longitud)', () => {
    const d = haversineMeters(-17.3935, -66.157, -17.3935, -66.1625);
    expect(d).toBeGreaterThan(560);
    expect(d).toBeLessThan(610);
  });

  it('es simétrica', () => {
    expect(haversineMeters(-17.39, -66.15, -17.40, -66.16)).toBeCloseTo(haversineMeters(-17.40, -66.16, -17.39, -66.15), 6);
  });
});

describe('placesWithin', () => {
  const at = (id: string, lat: number, lng: number) => ({ id, latitude: lat, longitude: lng });
  const me = { lat: -17.3935, lng: -66.157 };

  it('devuelve los lugares dentro del radio, del más cercano al más lejano, con su distancia', () => {
    const out = placesWithin(me.lat, me.lng, [at('lejos', -17.3935, -66.1625), at('medio', -17.3947, -66.157), at('cerca', -17.3938, -66.157)], 200);
    expect(out.map(p => p.id)).toEqual(['cerca', 'medio']);
    expect(out[0].distanceM).toBeLessThan(out[1].distanceM);
  });

  it('sin lugares cerca devuelve vacío', () => {
    expect(placesWithin(me.lat, me.lng, [at('lejos', -17.45, -66.2)], 150)).toEqual([]);
  });
});

describe('isCoolingDown', () => {
  const H = 3_600_000;
  it('sin aviso previo no hay espera', () => {
    expect(isCoolingDown(undefined, 1000 * H, 24 * H)).toBe(false);
  });

  it('dentro de las 24 h sigue esperando y pasadas ya no', () => {
    expect(isCoolingDown(100 * H, 110 * H, 24 * H)).toBe(true);
    expect(isCoolingDown(100 * H, 125 * H, 24 * H)).toBe(false);
  });
});

describe('isPreciseEnough', () => {
  it('acepta lecturas con buena precisión', () => {
    expect(isPreciseEnough(20, 100)).toBe(true);
    expect(isPreciseEnough(100, 100)).toBe(true);
  });

  it('rechaza lecturas imprecisas o sin dato de precisión', () => {
    expect(isPreciseEnough(250, 100)).toBe(false);
    expect(isPreciseEnough(null, 100)).toBe(false);
    expect(isPreciseEnough(undefined, 100)).toBe(false);
  });
});
