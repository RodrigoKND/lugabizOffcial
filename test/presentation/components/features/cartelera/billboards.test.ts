import { describe, it, expect } from 'vitest';
import {
  buildBillboards, rankFeatured, MAX_BILLBOARDS,
  type BillboardEvent, type BillboardPlace,
} from '@/presentation/components/features/cartelera/billboards';

const NOW = new Date(2026, 10, 25, 15, 0); // 25 nov 2026, 15:00 local
const day = (offset: number, hour = 20) => new Date(2026, 10, 25 + offset, hour, 0);

const ev = (id: string, dateStart: Date, extra: Partial<BillboardEvent> = {}): BillboardEvent =>
  ({ id, name: `Evento ${id}`, dateStart, timeStart: '20:00', category: { name: 'Música' }, ...extra });

const pl = (id: string, extra: Partial<BillboardPlace> = {}): BillboardPlace =>
  ({ id, name: `Lugar ${id}`, rating: 4.5, reviewCount: 10, createdAt: day(-60), category: { name: 'Café' }, ...extra });

describe('buildBillboards — eventos', () => {
  it('los eventos de hoy salen primero con etiqueta HOY', () => {
    const out = buildBillboards([ev('semana', day(2)), ev('hoy', day(0))], [], NOW);
    expect(out[0]).toMatchObject({ id: 'event-hoy', kicker: 'HOY', to: '/event/hoy', detail: '20:00' });
  });

  it('un evento en curso (empezó ayer y termina mañana) cuenta como hoy', () => {
    const out = buildBillboards([ev('largo', day(-1), { dateEnd: day(1) })], [], NOW);
    expect(out[0].kicker).toBe('HOY');
  });

  it('los de la semana van por fecha con día y número', () => {
    const out = buildBillboards([ev('b', day(5)), ev('a', day(2))], [], NOW);
    expect(out.map(b => b.id)).toEqual(['event-a', 'event-b']);
    expect(out[0].kicker).toMatch(/^[A-ZÁÉÍÓÚ]{3}\.? \d{1,2}$/);
  });

  it('descarta eventos pasados y de más de 7 días', () => {
    const out = buildBillboards([ev('ayer', day(-2)), ev('lejos', day(9))], [], NOW);
    expect(out).toEqual([]);
  });
});

describe('buildBillboards — lugares', () => {
  it('los lugares de los últimos 14 días son NUEVO', () => {
    const out = buildBillboards([], [pl('nuevo', { createdAt: day(-3) })], NOW);
    expect(out[0]).toMatchObject({ id: 'place-nuevo', kicker: 'NUEVO', to: '/place/nuevo', detail: 'Café' });
  });

  it('los destacados excluyen ocultos y mal puntuados', () => {
    const out = buildBillboards([], [pl('ok'), pl('oculto', { hidden: true }), pl('malo', { rating: 2 })], NOW);
    expect(out.map(b => b.id)).toEqual(['place-ok']);
  });

  it('un lugar nuevo no se repite como destacado', () => {
    const out = buildBillboards([], [pl('x', { createdAt: day(-1) })], NOW);
    expect(out).toHaveLength(1);
  });

  it('la rotación diaria cambia el orden de destacados pero no el conjunto', () => {
    const places = ['a', 'b', 'c', 'd'].map(id => pl(id));
    const hoy = buildBillboards([], places, NOW).map(b => b.id);
    const manana = buildBillboards([], places, day(1)).map(b => b.id);
    expect([...hoy].sort()).toEqual([...manana].sort());
    expect(hoy).not.toEqual(manana);
  });

  it('el mismo día el orden es estable', () => {
    const places = ['a', 'b', 'c'].map(id => pl(id));
    expect(buildBillboards([], places, NOW)).toEqual(buildBillboards([], places, day(0, 23)));
  });
});

describe('buildBillboards — mezcla', () => {
  it('respeta prioridad y el máximo', () => {
    const events = [ev('hoy', day(0)), ev('s1', day(1)), ev('s2', day(2)), ev('s3', day(3))];
    const places = [pl('n1', { createdAt: day(-1) }), pl('n2', { createdAt: day(-2) }), pl('d1'), pl('d2')];
    const out = buildBillboards(events, places, NOW);
    expect(out).toHaveLength(MAX_BILLBOARDS);
    expect(out[0].kicker).toBe('HOY');
    expect(new Set(out.map(b => b.id)).size).toBe(out.length);
  });

  it('sin datos devuelve vacío', () => {
    expect(buildBillboards([], [], NOW)).toEqual([]);
  });
});

describe('rankFeatured (reacciones)', () => {
  const totals = (jallalla: number, bien = 0, ahi = 0) => ({ jallalla, bien, ahi });

  it('sin totales ordena como siempre: puntuación y reseñas', () => {
    const out = rankFeatured([pl('a', { rating: 4.2 }), pl('b', { rating: 4.9, reviewCount: 40 })], NOW);
    expect(out.map(p => p.id)).toEqual(['b', 'a']);
  });

  it('con totales, lo muy querido supera a lo mejor puntuado sin votos', () => {
    const out = rankFeatured(
      [pl('sinVotos', { rating: 4.9, reviewCount: 80 }), pl('querido', { rating: 4.2 })],
      NOW, { querido: totals(12) },
    );
    expect(out[0].id).toBe('querido');
  });

  it('lo que la gente califica "Ahí nomás" baja de lugar', () => {
    const out = rankFeatured(
      [pl('mal', { rating: 4.9, reviewCount: 80 }), pl('neutro', { rating: 4.5 })],
      NOW, { mal: totals(0, 0, 15) },
    );
    expect(out.map(p => p.id)).toEqual(['neutro', 'mal']);
  });

  it('un lugar con pocas reseñas pero muy querido entra aunque su puntuación sea baja', () => {
    const out = rankFeatured([pl('chico', { rating: 3.5, reviewCount: 2 })], NOW, { chico: totals(15) });
    expect(out.map(p => p.id)).toEqual(['chico']);
  });

  it('un lugar poco querido y con puntuación baja sigue fuera', () => {
    expect(rankFeatured([pl('x', { rating: 3.5 })], NOW, { x: totals(0, 2, 6) })).toEqual([]);
  });

  it('buildBillboards usa los totales y la rotación diaria no entierra a los mejores', () => {
    const places = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(id => pl(id));
    const out = buildBillboards([], places, NOW, { h: totals(20) });
    expect(out.map(b => b.id)).toContain('place-h');
  });
});
