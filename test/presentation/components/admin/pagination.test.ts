import { describe, it, expect } from 'vitest';
import { pageWindow, totalPagesFor } from '@/presentation/components/features/admin/pagination';

describe('totalPagesFor', () => {
  it('redondea hacia arriba y nunca baja de 1', () => {
    expect(totalPagesFor(0, 20)).toBe(1);
    expect(totalPagesFor(20, 20)).toBe(1);
    expect(totalPagesFor(21, 20)).toBe(2);
  });
});

describe('pageWindow', () => {
  it('no muestra paginador si hay una sola página', () => {
    expect(pageWindow(1, 1)).toEqual([]);
  });
  it('muestra todas las páginas cuando son pocas', () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
    expect(pageWindow(4, 6)).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('usa puntos suspensivos al principio, en medio y al final', () => {
    expect(pageWindow(1, 10)).toEqual([1, 2, '…', 10]);
    expect(pageWindow(5, 10)).toEqual([1, '…', 4, 5, 6, '…', 10]);
    expect(pageWindow(10, 10)).toEqual([1, '…', 9, 10]);
  });
});
