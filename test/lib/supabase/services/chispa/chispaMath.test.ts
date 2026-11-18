import { describe, it, expect } from 'vitest';
import { pollPercentages } from '@/lib/supabase/services/chispa/pollMath';
import { passportLevel } from '@/lib/supabase/services/chispa/passportLevel';

describe('pollPercentages', () => {
  it('devuelve 0/0 sin votos', () => {
    expect(pollPercentages(0, 0)).toEqual({ a: 0, b: 0, total: 0 });
  });
  it('calcula porcentajes que suman 100', () => {
    expect(pollPercentages(54, 46)).toEqual({ a: 54, b: 46, total: 100 });
    const r = pollPercentages(1, 2);
    expect(r.a + r.b).toBe(100);
    expect(r.total).toBe(3);
  });
  it('ignora valores negativos', () => {
    expect(pollPercentages(-5, 5)).toEqual({ a: 0, b: 100, total: 5 });
  });
});

describe('passportLevel', () => {
  it('0 sellos: Turista, faltan 3', () => {
    expect(passportLevel(0)).toMatchObject({ name: 'Turista', next: 3, remaining: 3, progress: 0 });
  });
  it('7 sellos: Explorador, siguiente a 10', () => {
    const l = passportLevel(7);
    expect(l.name).toBe('Explorador');
    expect(l.next).toBe(10);
    expect(l.remaining).toBe(3);
  });
  it('30+ sellos: nivel máximo sin siguiente', () => {
    expect(passportLevel(45)).toMatchObject({ name: 'Cochabambino de pura cepa', next: null, remaining: 0, progress: 1 });
  });
  it('progress global respecto a la meta 30', () => {
    expect(passportLevel(15).progress).toBeCloseTo(0.5);
  });
});
