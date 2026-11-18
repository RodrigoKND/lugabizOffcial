import { describe, it, expect } from 'vitest';
import { formatPlanWhen, planShareUrl, planShareText, wrapLines } from '@/presentation/hooks/social/planShare';

describe('formatPlanWhen', () => {
  it('formatea fecha local sin correr el día', () => {
    expect(formatPlanWhen('2026-11-08', '19:30')).toMatch(/8/);
    expect(formatPlanWhen('2026-11-08', '19:30')).toContain('19:30');
  });
});

describe('planShareUrl', () => {
  it('apunta al evento si lo hay', () => {
    expect(planShareUrl('https://x.app', { eventId: 'e1', placeId: 'p1' })).toBe('https://x.app/event/e1');
  });
  it('apunta al lugar si no hay evento', () => {
    expect(planShareUrl('https://x.app', { placeId: 'p1' })).toBe('https://x.app/place/p1');
  });
  it('cae al origen sin destino', () => {
    expect(planShareUrl('https://x.app', {})).toBe('https://x.app');
  });
});

describe('planShareText', () => {
  it('incluye nombre y momento', () => {
    const t = planShareText('El Prado', 'sáb 8 nov · 19:30');
    expect(t).toContain('El Prado');
    expect(t).toContain('sáb 8 nov · 19:30');
  });
});

describe('wrapLines', () => {
  const measure = (s: string) => s.length * 10;
  it('parte en líneas que caben', () => {
    expect(wrapLines('uno dos tres cuatro', 90, measure)).toEqual(['uno dos', 'tres', 'cuatro']);
  });
  it('no pierde una palabra más larga que el ancho', () => {
    expect(wrapLines('supercalifragilistico', 50, measure)).toEqual(['supercalifragilistico']);
  });
  it('texto vacío da lista vacía', () => {
    expect(wrapLines('  ', 90, measure)).toEqual([]);
  });
});
