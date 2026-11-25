export interface VerdictTotals {
  jallalla: number;
  bien: number;
  ahi: number;
}

const PRIOR = 0.5;         // lo que se supone de un negocio sin votos
const PRIOR_WEIGHT = 5;    // cuántos votos "pesa" esa suposición: con pocos votos manda el prior
const FULL_VOLUME = 50;    // desde acá más votos ya no suman impulso
const W_SATISFACTION = 0.7;
const W_MOMENTUM = 0.3;
const NEW_BOOST = 0.15;
export const NEW_DAYS = 14;
export const NEUTRAL_SCORE = W_SATISFACTION * PRIOR;

const votes = (t: VerdictTotals) => t.jallalla + t.bien + t.ahi;

// Qué tan querido es (0–1), suavizado: un solo voto no dispara ni hunde a un negocio con pocos votos.
export function satisfaction(t: VerdictTotals): number {
  return (t.jallalla + 0.5 * t.bien + PRIOR * PRIOR_WEIGHT) / (votes(t) + PRIOR_WEIGHT);
}

// Puntaje de visibilidad. Privilegia lo querido sobre lo grande: el volumen ayuda poco y con tope,
// y un negocio nuevo recibe un bono que decae a cero a los 14 días. Sin votos = valor neutro.
export function trendScore(t: VerdictTotals, ageDays: number): number {
  const momentum = Math.min(1, Math.log1p(votes(t)) / Math.log1p(FULL_VOLUME));
  const age = Math.max(0, ageDays);
  const novelty = age >= NEW_DAYS ? 0 : NEW_BOOST * (1 - age / NEW_DAYS);
  return W_SATISFACTION * satisfaction(t) + W_MOMENTUM * (votes(t) === 0 ? 0 : momentum) + novelty;
}
