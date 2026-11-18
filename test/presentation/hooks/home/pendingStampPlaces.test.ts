import { describe, it, expect } from 'vitest';
import { pendingStampPlaces } from '@/presentation/hooks/home/pendingStampPlaces';

const places = [
  { id: '1', name: 'A', rating: 3 },
  { id: '2', name: 'B', rating: 5 },
  { id: '3', name: 'C', rating: 4 },
];

describe('pendingStampPlaces', () => {
  it('excluye sellados y ordena por rating', () => {
    expect(pendingStampPlaces(places, new Set(['2'])).map(p => p.id)).toEqual(['3', '1']);
  });
  it('respeta el límite', () => {
    expect(pendingStampPlaces(places, new Set(), 2)).toHaveLength(2);
  });
  it('no muta el arreglo original', () => {
    pendingStampPlaces(places, new Set());
    expect(places.map(p => p.id)).toEqual(['1', '2', '3']);
  });
});
