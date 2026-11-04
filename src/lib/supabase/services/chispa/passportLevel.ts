export interface PassportLevel {
  name: string;
  next: number | null;
  remaining: number;
  progress: number;
}

export const PASSPORT_GOAL = 30;

const LEVELS = [
  { min: 0, name: 'Turista' },
  { min: 3, name: 'Explorador' },
  { min: 10, name: 'Cochabambino' },
  { min: PASSPORT_GOAL, name: 'Cochabambino de pura cepa' },
];

// Nivel del pasaporte según la cantidad de sellos (lugares visitados).
export function passportLevel(stamps: number): PassportLevel {
  const count = Math.max(0, stamps);
  const idx = LEVELS.reduce((acc, lvl, i) => (count >= lvl.min ? i : acc), 0);
  const next = LEVELS[idx + 1]?.min ?? null;
  return {
    name: LEVELS[idx].name,
    next,
    remaining: next === null ? 0 : next - count,
    progress: Math.min(1, count / PASSPORT_GOAL),
  };
}
