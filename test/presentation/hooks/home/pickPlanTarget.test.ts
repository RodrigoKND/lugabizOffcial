import { describe, it, expect } from 'vitest';
import { pickPlanTarget } from '@/presentation/hooks/home/pickPlanTarget';

const now = new Date('2026-11-04T12:00:00Z');

describe('pickPlanTarget', () => {
  it('elige el próximo evento futuro más cercano', () => {
    const t = pickPlanTarget(
      [
        { id: 'old', name: 'Pasado', dateStart: '2026-11-01T10:00:00Z' },
        { id: 'far', name: 'Lejano', dateStart: '2026-12-01T10:00:00Z' },
        { id: 'near', name: 'Cercano', dateStart: '2026-11-05T10:00:00Z' },
      ],
      [{ id: 'p', name: 'Lugar', rating: 5 }],
      now,
    );
    expect(t).toMatchObject({ eventId: 'near', name: 'Cercano' });
    expect(t?.placeId).toBeUndefined();
  });
  it('sin eventos usa el lugar mejor valorado', () => {
    const t = pickPlanTarget([], [{ id: 'a', name: 'A', rating: 3 }, { id: 'b', name: 'B', rating: 4.8 }], now);
    expect(t).toMatchObject({ placeId: 'b', name: 'B', when: 'Hoy' });
  });
  it('sin datos devuelve null', () => {
    expect(pickPlanTarget([], [], now)).toBeNull();
  });
});
