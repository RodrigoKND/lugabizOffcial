import { describe, it, expect } from 'vitest';
import { trendScore, satisfaction, NEUTRAL_SCORE, NEW_DAYS, type VerdictTotals } from '@domain/rules/trendScore';

const t = (jallalla: number, bien = 0, ahi = 0): VerdictTotals => ({ jallalla, bien, ahi });
const OLD = 365;

describe('satisfaction', () => {
  it('sin votos es neutra (0.5), no cero', () => {
    expect(satisfaction(t(0))).toBe(0.5);
  });

  it('un solo voto no la dispara ni la hunde', () => {
    expect(satisfaction(t(1))).toBeLessThan(0.7);
    expect(satisfaction(t(0, 0, 1))).toBeGreaterThan(0.3);
  });

  it('Bien nomás vale la mitad que Al palo', () => {
    expect(satisfaction(t(0, 10))).toBeLessThan(satisfaction(t(10)));
    expect(satisfaction(t(0, 10))).toBeGreaterThan(satisfaction(t(0, 0, 10)));
  });
});

describe('trendScore', () => {
  it('sin votos y sin novedad da el valor neutro', () => {
    expect(trendScore(t(0), OLD)).toBeCloseTo(NEUTRAL_SCORE, 5);
  });

  it('mucho "Ahí nomás" queda por debajo de neutro, por más volumen que tenga', () => {
    expect(trendScore(t(0, 0, 10), OLD)).toBeLessThan(NEUTRAL_SCORE);
    expect(trendScore(t(0, 0, 100), OLD)).toBeLessThan(NEUTRAL_SCORE);
  });

  it('igualdad de oportunidades: un negocio chico muy querido supera a uno grande con opiniones divididas', () => {
    const smallLoved = trendScore(t(10), OLD);
    const bigMixed = trendScore(t(50, 0, 50), OLD);
    expect(smallLoved).toBeGreaterThan(bigMixed);
  });

  it('el volumen ayuda, pero con tope (más de 50 votos no suma más)', () => {
    expect(trendScore(t(30), OLD)).toBeGreaterThan(trendScore(t(3), OLD));
    expect(trendScore(t(500), OLD)).toBeCloseTo(trendScore(t(60), OLD), 1);
  });

  it('un negocio nuevo recibe un bono que decae hasta cero a los 14 días', () => {
    const day0 = trendScore(t(0), 0);
    const day7 = trendScore(t(0), 7);
    const day14 = trendScore(t(0), NEW_DAYS);
    expect(day0).toBeCloseTo(NEUTRAL_SCORE + 0.15, 5);
    expect(day7).toBeLessThan(day0);
    expect(day7).toBeGreaterThan(day14);
    expect(day14).toBeCloseTo(NEUTRAL_SCORE, 5);
  });

  it('es determinista y finita', () => {
    expect(trendScore(t(3, 2, 1), 5)).toBe(trendScore(t(3, 2, 1), 5));
    expect(Number.isFinite(trendScore(t(0), -3))).toBe(true);
  });
});
