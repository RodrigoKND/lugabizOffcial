import { describe, it, expect } from 'vitest';
import { buildRoadmap, type RoadmapInput } from '@/presentation/components/features/advisor/roadmap';

const report = (extra: Partial<RoadmapInput> = {}): RoadmapInput => ({
  verdict: { score: 78, label: 'alta' },
  competition: { level: 'media' },
  demand: { level: 'alta' },
  products: [{}, {}, {}, {}],
  differentiators: [{}],
  survey: { recommendedSampleSize: 120 },
  investment: { level: 'media', range: 'Bs 20.000–40.000' },
  ...extra,
});

describe('buildRoadmap', () => {
  it('arma las 6 paradas en orden, terminando en Lugabiz', () => {
    expect(buildRoadmap(report()).map(s => s.id)).toEqual(['idea', 'market', 'offer', 'survey', 'money', 'lugabiz']);
  });

  it('los resúmenes salen del informe', () => {
    const byId = Object.fromEntries(buildRoadmap(report()).map(s => [s.id, s]));
    expect(byId.idea.summary).toBe('Alta viabilidad · 78/100');
    expect(byId.market.summary).toBe('Competencia media · Demanda alta');
    expect(byId.offer.summary).toBe('4 ideas para tu carta');
    expect(byId.survey.summary).toBe('Pregunta a 120 personas antes de invertir');
    expect(byId.money.summary).toBe('Inversión media · Bs 20.000–40.000');
  });

  it('cada parada del informe apunta a su pestaña y la de Lugabiz a ninguna', () => {
    const byId = Object.fromEntries(buildRoadmap(report()).map(s => [s.id, s]));
    expect(byId.idea.tab).toBe('veredicto');
    expect(byId.market.tab).toBe('competencia');
    expect(byId.offer.tab).toBe('oferta');
    expect(byId.survey.tab).toBe('encuesta');
    expect(byId.money.tab).toBe('plan');
    expect(byId.lugabiz.tab).toBeUndefined();
  });

  it('sin productos usa las formas de diferenciarse; sin nada omite la parada', () => {
    const diff = buildRoadmap(report({ products: [], differentiators: [{}, {}] })).find(s => s.id === 'offer');
    expect(diff?.summary).toBe('2 formas de diferenciarte');
    const none = buildRoadmap(report({ products: [], differentiators: [] }));
    expect(none.map(s => s.id)).not.toContain('offer');
    expect(none).toHaveLength(5);
  });

  it('sin rango ni muestra recomendada da textos de respaldo', () => {
    const stops = buildRoadmap(report({ investment: { level: 'baja' }, survey: { recommendedSampleSize: 0 } }));
    expect(stops.find(s => s.id === 'money')?.summary).toBe('Inversión baja');
    expect(stops.find(s => s.id === 'survey')?.summary).toBe('Pregunta a tus futuros clientes');
  });

  it('una etiqueta de viabilidad desconocida no rompe', () => {
    const idea = buildRoadmap(report({ verdict: { score: 10, label: 'rara' } })).find(s => s.id === 'idea');
    expect(idea?.summary).toBe('rara · 10/100');
  });
});
