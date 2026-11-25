import { describe, it, expect } from 'vitest';
import { spotsLabel } from '@/presentation/components/features/events/detail/sidebar/spots';

describe('spotsLabel', () => {
  it('sin límite de cupos no muestra nada', () => {
    expect(spotsLabel(0, 12)).toBeNull();
    expect(spotsLabel(-1, 0)).toBeNull();
  });

  it('muestra cuántos cupos quedan', () => {
    expect(spotsLabel(50, 20)).toBe('30 cupos disponibles');
  });

  it('avisa cuando queda el último cupo', () => {
    expect(spotsLabel(10, 9)).toBe('Queda 1 cupo');
  });

  it('cupo lleno, incluso si hay más anotados que cupos', () => {
    expect(spotsLabel(10, 10)).toBe('Cupo lleno');
    expect(spotsLabel(10, 14)).toBe('Cupo lleno');
  });
});
