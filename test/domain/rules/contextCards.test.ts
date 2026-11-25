import { describe, it, expect } from 'vitest';
import { slotForHour, hourInLaPaz } from '@domain/rules/contextIntents';
import { buildContextCards, type ContextPlace } from '@domain/rules/contextCards';

const OLD = new Date(2025, 0, 1);
const pl = (id: string, category: string, extra: Partial<ContextPlace> = {}): ContextPlace =>
  ({ id, name: `Lugar ${id}`, rating: 4.4, createdAt: OLD, category: { name: category }, ...extra });

// 25 nov 2026 a las `hour` (hora de La Paz = UTC-4)
const at = (hour: number, dayOffset = 0) => new Date(Date.UTC(2026, 10, 25 + dayOffset, hour + 4, 0));
const input = (hour: number, places: ContextPlace[], extra = {}) => ({ now: at(hour), places, tempC: 20, ...extra });

describe('slotForHour / hourInLaPaz', () => {
  it('divide el día en franjas', () => {
    expect([5, 6, 10, 11, 14, 15, 18, 19, 23, 0].map(slotForHour))
      .toEqual(['madrugada', 'manana', 'manana', 'mediodia', 'mediodia', 'tarde', 'tarde', 'noche', 'noche', 'madrugada']);
  });

  it('usa la hora de La Paz, no la del navegador', () => {
    expect(hourInLaPaz(new Date(Date.UTC(2026, 10, 25, 15, 0)))).toBe(11);
    expect(hourInLaPaz(new Date(Date.UTC(2026, 10, 25, 4, 0)))).toBe(0);
  });
});

describe('buildContextCards', () => {
  it('en la mañana sugiere desayuno / café', () => {
    const cards = buildContextCards(input(8, [pl('cafe', 'Cafetería'), pl('bar', 'Bar')]));
    expect(cards.map(c => c.id)).toEqual(['place-cafe']);
    expect(cards[0].headline).toBe('¿Ya desayunaste? Prueba Lugar cafe');
  });

  it('a mediodía sugiere restaurantes', () => {
    const cards = buildContextCards(input(13, [pl('resto', 'Restaurante'), pl('cafe', 'Cafetería')]));
    expect(cards[0].id).toBe('place-resto');
    expect(cards[0].headline).toContain('almorzar');
  });

  it('en la noche sugiere bares y salidas', () => {
    const cards = buildContextCards(input(21, [pl('bar', 'Bar'), pl('cafe', 'Cafetería')]));
    expect(cards.map(c => c.id)).toEqual(['place-bar']);
  });

  it('de madrugada no sugiere nada', () => {
    expect(buildContextCards(input(3, [pl('bar', 'Bar')]))).toEqual([]);
  });

  it('con calor suma una sugerencia fresca y la pone primero', () => {
    const cards = buildContextCards(input(16, [pl('helado', 'Heladería'), pl('cafe', 'Cafetería')], { tempC: 29 }));
    expect(cards[0].id).toBe('place-helado');
    expect(cards[0].headline).toContain('calor');
    expect(cards[0].reason).toContain('29');
  });

  it('con frío suma una sugerencia calentita', () => {
    const cards = buildContextCards(input(16, [pl('cafe', 'Cafetería')], { tempC: 10 }));
    expect(cards[0].headline).toContain('frío');
  });

  it('sin temperatura solo usa la hora', () => {
    const cards = buildContextCards(input(8, [pl('cafe', 'Cafetería')], { tempC: null }));
    expect(cards).toHaveLength(1);
    expect(cards[0].reason).toBe('Sugerencia por la hora');
  });

  it('nunca repite un lugar entre tarjetas y respeta el límite', () => {
    const places = [pl('a', 'Cafetería'), pl('b', 'Heladería'), pl('c', 'Restaurante')];
    const cards = buildContextCards(input(16, places, { tempC: 30 }), 2);
    expect(cards).toHaveLength(2);
    expect(new Set(cards.map(c => c.id)).size).toBe(2);
  });

  it('ignora lugares ocultos y categorías que no encajan', () => {
    expect(buildContextCards(input(8, [pl('x', 'Cafetería', { hidden: true }), pl('y', 'Ferretería')]))).toEqual([]);
  });

  it('un lugar muy querido sale antes que uno sin votos', () => {
    const places = [pl('sinVotos', 'Cafetería', { rating: 4.9 }), pl('querido', 'Cafetería', { rating: 4.0 })];
    const cards = buildContextCards({ ...input(8, places), totals: { querido: { jallalla: 15, bien: 2, ahi: 0 } } });
    expect(cards[0].id).toBe('place-querido');
  });

  it('rota entre los candidatos según el día para que todos tengan su turno', () => {
    const places = ['a', 'b', 'c'].map(id => pl(id, 'Cafetería'));
    const firsts = [0, 1, 2].map(d => buildContextCards({ now: at(8, d), places, tempC: 20 })[0].id);
    expect(new Set(firsts).size).toBeGreaterThan(1);
  });

  it('muestra cuánto falta a pie solo si hay ubicación del usuario y del lugar', () => {
    const near = pl('near', 'Cafetería', { latitude: -17.3935, longitude: -66.157 });
    const withCoords = buildContextCards({ ...input(8, [near]), coords: { lat: -17.3935, lng: -66.1625 } });
    expect(withCoords[0].distance).toMatch(/^a \d+ min caminando$/);
    expect(buildContextCards(input(8, [near]))[0].distance).toBeUndefined();
    expect(buildContextCards({ ...input(8, [pl('nocoords', 'Cafetería')]), coords: { lat: -17.39, lng: -66.15 } })[0].distance).toBeUndefined();
  });
});
