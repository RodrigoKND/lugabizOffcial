import { describe, it, expect } from 'vitest';
import { summarizeInsight } from '@domain/rules/ownerInsight';
import type { OwnerInsight } from '@domain/entities/OwnerInsight';

const base: OwnerInsight = { placeId: 'p1', name: 'Café Sol', views: 0, plans: 0, jallalla: 0, bien: 0, ahi: 0, picks: 0, picksWon: 0 };
const i = (extra: Partial<OwnerInsight>): OwnerInsight => ({ ...base, ...extra });

describe('summarizeInsight', () => {
  it('sin actividad no inventa números: invita a compartir el cartel', () => {
    const s = summarizeInsight(base);
    expect(s.hasActivity).toBe(false);
    expect(s.reactions).toBe(0);
    expect(s.headline).toBe('Aún no hay actividad. Comparte tu cartel para recibir reacciones.');
  });

  it('destaca lo mejor: los "Al palo", en singular y plural', () => {
    expect(summarizeInsight(i({ jallalla: 1 })).headline).toBe('1 persona dijo Al palo');
    expect(summarizeInsight(i({ jallalla: 12, bien: 3 })).headline).toBe('12 personas dijeron Al palo');
  });

  it('sin "Al palo" destaca los "Bien nomás"', () => {
    expect(summarizeInsight(i({ bien: 4 })).headline).toBe('4 personas dijeron Bien nomás');
  });

  it('si solo hay "Ahí nomás" lo dice con respeto y sugiere mejorar', () => {
    const s = summarizeInsight(i({ ahi: 3 }));
    expect(s.headline).toContain('Ahí nomás');
    expect(s.headline).toContain('mejorar');
  });

  it('suma todas las reacciones', () => {
    expect(summarizeInsight(i({ jallalla: 2, bien: 3, ahi: 1 })).reactions).toBe(6);
  });

  it('menciona las votaciones ganadas', () => {
    expect(summarizeInsight(i({ jallalla: 2, picksWon: 2 })).headline).toBe('2 personas dijeron Al palo · ganó 2 votaciones');
    expect(summarizeInsight(i({ jallalla: 2, picksWon: 1 })).headline).toBe('2 personas dijeron Al palo · ganó 1 votación');
  });

  it('con vistas o votaciones pero sin reacciones aún cuenta como actividad', () => {
    expect(summarizeInsight(i({ views: 40 })).hasActivity).toBe(true);
    expect(summarizeInsight(i({ picks: 2 })).headline).toBe('Apareció en 2 votaciones');
  });
});
