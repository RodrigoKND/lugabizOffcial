import { describe, it, expect } from 'vitest';
import { pickCandidates } from '@/presentation/components/features/social/pick/pickCandidates';

const places = [
  { id: 'p1', name: 'Café Sol', rating: 4.8, category: { name: 'Cafetería' } },
  { id: 'p2', name: 'Pizzería Luna', rating: 4.1, category: { name: 'Comida' } },
  { id: 'p3', name: 'Parque Cala Cala', rating: 4.5, category: { name: 'Parque' } },
];
const events = [{ id: 'e1', name: 'Feria del Libro' }, { id: 'e2', name: 'Noche de peña' }];

describe('pickCandidates', () => {
  it('sin búsqueda sugiere los lugares mejor puntuados', () => {
    const out = pickCandidates('', places, events, []);
    expect(out.map(o => o.key)).toEqual(['place:p1', 'place:p3', 'place:p2']);
  });

  it('busca por nombre sin importar mayúsculas ni tildes', () => {
    expect(pickCandidates('CAFE', places, events, []).map(o => o.key)).toEqual(['place:p1']);
    expect(pickCandidates('pena', places, events, []).map(o => o.key)).toEqual(['event:e2']);
  });

  it('también busca por categoría del lugar', () => {
    expect(pickCandidates('parque', places, events, []).map(o => o.key)).toEqual(['place:p3']);
  });

  it('marca si es lugar o evento con su id correcto', () => {
    const [place] = pickCandidates('sol', places, events, []);
    expect(place).toMatchObject({ placeId: 'p1', name: 'Café Sol' });
    expect(place.eventId).toBeUndefined();
    const [event] = pickCandidates('feria', places, events, []);
    expect(event).toMatchObject({ eventId: 'e1' });
  });

  it('excluye lo que ya está elegido y respeta el límite', () => {
    expect(pickCandidates('', places, events, ['place:p1']).map(o => o.key)).not.toContain('place:p1');
    expect(pickCandidates('', places, events, [], 2)).toHaveLength(2);
  });
});
