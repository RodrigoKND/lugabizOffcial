import { describe, it, expect } from 'vitest';
import { blendCompatibility, MIN_SIGNALS, type TasteProfile } from '@domain/rules/blendCompatibility';

const profile = (liked: string[], categories: Record<string, number>, disliked: string[] = []): TasteProfile => ({ liked, disliked, categories });

const A = profile(['p1', 'p2', 'p3', 'p4', 'p5'], { comida: 3, noche: 2 });

describe('blendCompatibility', () => {
  it('gustos idénticos dan 100', () => {
    const r = blendCompatibility(A, profile([...A.liked], { ...A.categories }));
    expect(r.enoughData).toBe(true);
    expect(r.percent).toBe(100);
    expect(r.sharedLiked).toEqual(A.liked);
  });

  it('gustos y categorías totalmente distintos dan 0', () => {
    const B = profile(['x1', 'x2', 'x3', 'x4', 'x5'], { musica: 4, deporte: 1 });
    const r = blendCompatibility(A, B);
    expect(r.percent).toBe(0);
    expect(r.sharedLiked).toEqual([]);
  });

  it('coincidencia parcial queda entre 0 y 100', () => {
    // Comparten p3, p4, p5 → Jaccard 3/7; mismas categorías → coseno 1 → 0.6×0.4286 + 0.4 = 0.657
    const B = profile(['p3', 'p4', 'p5', 'q6', 'q7'], { comida: 3, noche: 2 });
    const r = blendCompatibility(A, B);
    expect(r.percent).toBe(66);
    expect(r.sharedLiked).toEqual(['p3', 'p4', 'p5']);
  });

  it('los choques (te gusta lo que a el otro no) bajan el porcentaje', () => {
    const same = profile(['p3', 'p4', 'p5', 'q6', 'q7'], { comida: 3, noche: 2 });
    const withClash = profile(['p3', 'p4', 'p5', 'q6', 'q7'], { comida: 3, noche: 2 }, ['p1']);
    const base = blendCompatibility(A, same);
    const clash = blendCompatibility(A, withClash);
    expect(clash.conflicts).toEqual(['p1']);
    expect(clash.percent).toBeLessThan(base.percent);
  });

  it('con pocas señales no inventa un porcentaje', () => {
    const poor = profile(['p1'], { comida: 1 });
    const r = blendCompatibility(A, poor);
    expect(r.enoughData).toBe(false);
    expect(r.percent).toBe(0);
    expect(r.sharedLiked).toEqual([]);
  });

  it('el mínimo de señales cuenta gustos y no-gustos', () => {
    expect(MIN_SIGNALS).toBe(5);
    const mixed = profile(['p1', 'p2', 'p3'], { comida: 1 }, ['d1', 'd2']);
    expect(blendCompatibility(mixed, mixed).enoughData).toBe(true);
  });

  it('es simétrica: mezclar A con B da lo mismo que B con A', () => {
    const B = profile(['p3', 'p4', 'q6', 'q7', 'q8'], { comida: 1, musica: 3 }, ['p1']);
    expect(blendCompatibility(A, B).percent).toBe(blendCompatibility(B, A).percent);
  });

  it('el resultado siempre está entre 0 y 100', () => {
    const B = profile(['p1', 'p2', 'p3', 'p4', 'p5'], { comida: 9 }, ['p1']);
    const { percent } = blendCompatibility(A, B);
    expect(percent).toBeGreaterThanOrEqual(0);
    expect(percent).toBeLessThanOrEqual(100);
  });

  it('categorías vacías no rompen (sin NaN)', () => {
    const noCats = profile(['p1', 'p2', 'p3', 'p4', 'p5'], {});
    const r = blendCompatibility(noCats, noCats);
    expect(Number.isFinite(r.percent)).toBe(true);
    expect(r.percent).toBe(60);
  });
});
