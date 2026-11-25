export type DetailTab = 'veredicto' | 'oferta' | 'competencia' | 'encuesta' | 'plan';
export type StopId = 'idea' | 'market' | 'offer' | 'survey' | 'money' | 'lugabiz';

export interface RoadmapStop {
  id: StopId;
  title: string;
  summary: string;
  tab?: DetailTab;
}

// Solo lo que el camino necesita del informe del asesor (BusinessAdvisorReport encaja tal cual).
export interface RoadmapInput {
  verdict: { score: number; label: string };
  competition: { level: string };
  demand: { level: string };
  products: unknown[];
  differentiators: unknown[];
  survey: { recommendedSampleSize: number };
  investment: { level: string; range?: string };
}

const VERDICT_LABEL: Record<string, string> = {
  alta: 'Alta viabilidad', media: 'Viabilidad media', baja: 'Baja viabilidad',
};

function offerSummary(r: RoadmapInput): string {
  if (r.products.length > 0) return `${r.products.length} ideas para tu carta`;
  return `${r.differentiators.length} formas de diferenciarte`;
}

// Las paradas del camino a partir del informe. "Qué ofrecer" se omite si el informe no trae nada para eso.
export function buildRoadmap(r: RoadmapInput): RoadmapStop[] {
  const hasOffer = r.products.length > 0 || r.differentiators.length > 0;
  const sample = r.survey.recommendedSampleSize;

  const stops: Array<RoadmapStop | null> = [
    { id: 'idea', title: '¿Vale la pena?', tab: 'veredicto',
      summary: `${VERDICT_LABEL[r.verdict.label] ?? r.verdict.label} · ${r.verdict.score}/100` },
    { id: 'market', title: 'Mercado', tab: 'competencia',
      summary: `Competencia ${r.competition.level} · Demanda ${r.demand.level}` },
    hasOffer ? { id: 'offer', title: 'Qué ofrecer', tab: 'oferta', summary: offerSummary(r) } : null,
    { id: 'survey', title: 'Pregunta a la gente', tab: 'encuesta',
      summary: sample > 0 ? `Pregunta a ${sample} personas antes de invertir` : 'Pregunta a tus futuros clientes' },
    { id: 'money', title: 'Cuánta plata', tab: 'plan',
      summary: `Inversión ${r.investment.level}${r.investment.range ? ` · ${r.investment.range}` : ''}` },
    { id: 'lugabiz', title: 'Abre y sal en Lugabiz', summary: 'Verifica tu negocio y recibe tu cartel.' },
  ];
  return stops.filter((s): s is RoadmapStop => s !== null);
}
