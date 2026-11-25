import { describe, it, expect } from 'vitest';
import { posterTheme, headlineSize, POSTER_THEMES } from '@/presentation/components/features/cartel/posterTheme';

describe('posterTheme', () => {
  it('comida y café van en maíz', () => {
    expect(posterTheme('Restaurante').key).toBe('maiz');
    expect(posterTheme('Café').key).toBe('maiz');
  });

  it('música y fiestas van en coral', () => {
    expect(posterTheme('Música en vivo').key).toBe('coral');
    expect(posterTheme('Festival').key).toBe('coral');
  });

  it('bares y noche van en lila', () => {
    expect(posterTheme('Bar').key).toBe('lila');
    expect(posterTheme('Discoteca').key).toBe('lila');
  });

  it('ignora mayúsculas y tildes', () => {
    expect(posterTheme('CAFÉ').key).toBe('maiz');
    expect(posterTheme('MÚSICA').key).toBe('coral');
  });

  it('una categoría desconocida siempre da el mismo tema válido', () => {
    const a = posterTheme('Papelería');
    expect(posterTheme('Papelería')).toEqual(a);
    expect(POSTER_THEMES).toContainEqual(a);
  });

  it('sin categoría usa un tema válido', () => {
    expect(POSTER_THEMES).toContainEqual(posterTheme(undefined));
    expect(POSTER_THEMES).toContainEqual(posterTheme(''));
  });

  it('todos los temas usan tinta oscura para el contraste', () => {
    POSTER_THEMES.forEach(t => expect(t.ink).toBe('text-lg-ink'));
  });
});

describe('headlineSize', () => {
  it('nombres cortos van grandes y los largos van más chicos', () => {
    expect(headlineSize('Café Sol')).toBe('text-3xl');
    expect(headlineSize('Pizzería Don Mario')).toBe('text-2xl');
    expect(headlineSize('Restaurante El Buen Sabor')).toBe('text-xl');
    expect(headlineSize('Centro de Eventos y Convenciones Valle Hermoso')).toBe('text-lg');
  });

  it('un nombre vacío no rompe', () => {
    expect(headlineSize('')).toBe('text-3xl');
  });

  it('las pantallas de la cartelera usan una escala mayor', () => {
    expect(headlineSize('Café Sol', true)).toBe('text-5xl');
    expect(headlineSize('Pizzería Don Mario', true)).toBe('text-4xl');
    expect(headlineSize('Restaurante El Buen Sabor', true)).toBe('text-3xl');
    expect(headlineSize('Centro de Eventos y Convenciones Valle Hermoso', true)).toBe('text-2xl');
  });
});
