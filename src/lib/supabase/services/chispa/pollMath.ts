export interface PollPercentages {
  a: number;
  b: number;
  total: number;
}

// Porcentajes enteros de una votación de 2 opciones (suman 100 si hay votos).
export function pollPercentages(votesA: number, votesB: number): PollPercentages {
  const a = Math.max(0, votesA);
  const b = Math.max(0, votesB);
  const total = a + b;
  if (total === 0) return { a: 0, b: 0, total: 0 };
  const pa = Math.round((a / total) * 100);
  return { a: pa, b: 100 - pa, total };
}
