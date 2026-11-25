import type { OwnerInsight } from '@domain/entities/OwnerInsight';

export interface InsightSummary {
  reactions: number;
  hasActivity: boolean;
  headline: string;
}

const people = (n: number, one: string, many: string) => `${n} ${n === 1 ? `persona ${one}` : `personas ${many}`}`;

// Una frase corta con lo más importante de un negocio (un solo dato principal). Nunca inventa números.
export function summarizeInsight(i: OwnerInsight): InsightSummary {
  const reactions = i.jallalla + i.bien + i.ahi;
  const hasActivity = reactions > 0 || i.picks > 0 || i.views > 0 || i.plans > 0;
  if (!hasActivity) {
    return { reactions, hasActivity, headline: 'Aún no hay actividad. Comparte tu cartel para recibir reacciones.' };
  }

  let main: string;
  if (i.jallalla > 0) main = `${people(i.jallalla, 'dijo', 'dijeron')} Al palo`;
  else if (i.bien > 0) main = `${people(i.bien, 'dijo', 'dijeron')} Bien nomás`;
  else if (i.ahi > 0) main = `${people(i.ahi, 'dijo', 'dijeron')} Ahí nomás: mira qué puedes mejorar`;
  else if (i.picks > 0) main = `Apareció en ${i.picks} ${i.picks === 1 ? 'votación' : 'votaciones'}`;
  else main = 'Tu lugar ya tiene visitas';

  const won = i.picksWon > 0 && reactions > 0 ? ` · ganó ${i.picksWon} ${i.picksWon === 1 ? 'votación' : 'votaciones'}` : '';
  return { reactions, hasActivity, headline: main + won };
}
