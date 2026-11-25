import type { VerdictKey } from '@domain/entities/Verdict';

export const VERDICT_POINTS: Record<VerdictKey, number> = { jallalla: 2, bien: 1, ahi: 0 };

export interface PickOption {
  id: string;
  // Orden en que se agregó la opción: desempata a favor de la primera.
  position: number;
}

export interface PickVote {
  optionId: string;
  userId: string;
  verdict: VerdictKey;
}

export interface OptionTally {
  optionId: string;
  score: number;
  votes: number;
  counts: Record<VerdictKey, number>;
}

// Cuenta los votos por opción y ordena: más puntos, luego más "Al palo", luego la agregada primero.
// Si una persona votó dos veces la misma opción cuenta la última. Los votos de opciones desconocidas se ignoran.
export function tallyOptions(options: PickOption[], votes: PickVote[]): OptionTally[] {
  const known = new Set(options.map(o => o.id));
  const latest = new Map<string, PickVote>();
  votes.filter(v => known.has(v.optionId)).forEach(v => latest.set(`${v.optionId}|${v.userId}`, v));

  const tally = new Map<string, OptionTally>(options.map(o => [o.id, {
    optionId: o.id, score: 0, votes: 0, counts: { jallalla: 0, bien: 0, ahi: 0 },
  }]));
  latest.forEach(v => {
    const t = tally.get(v.optionId)!;
    t.counts[v.verdict] += 1;
    t.votes += 1;
    t.score += VERDICT_POINTS[v.verdict];
  });

  const position = new Map(options.map(o => [o.id, o.position]));
  return [...tally.values()].sort((a, b) =>
    b.score - a.score || b.counts.jallalla - a.counts.jallalla || position.get(a.optionId)! - position.get(b.optionId)!);
}

// `tally` debe venir de tallyOptions (ya ordenado). Sin ningún voto no hay ganador.
export function pickWinner(tally: OptionTally[]): string | null {
  if (tally.length === 0 || tally.every(t => t.votes === 0)) return null;
  return tally[0].optionId;
}

// Completa = cada miembro votó cada opción. Los votos de quien no es miembro no cuentan.
export function isVotingComplete(memberIds: string[], options: PickOption[], votes: PickVote[]): boolean {
  if (memberIds.length === 0 || options.length === 0) return false;
  const cast = new Set(votes.map(v => `${v.userId}|${v.optionId}`));
  return memberIds.every(u => options.every(o => cast.has(`${u}|${o.id}`)));
}

// Aplica (o quita, con null) el voto de una persona en una opción. Devuelve una lista nueva.
export function setVote(votes: PickVote[], optionId: string, userId: string, verdict: VerdictKey | null): PickVote[] {
  const rest = votes.filter(v => !(v.optionId === optionId && v.userId === userId));
  return verdict === null ? rest : [...rest, { optionId, userId, verdict }];
}
