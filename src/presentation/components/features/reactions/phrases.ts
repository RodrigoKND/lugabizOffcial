// Frases cortas cochabambinas para el "mar de corazones". Solo texto, sin ilustraciones.
export const PHRASES = [
  "¡Ta' pues!",
  'Vamos pues',
  'Jallalla',
  'Al toque',
  'Bien nomás',
  'Qué rico',
  'Salteñazo',
  'Pura chicha',
  'Cochala de corazón',
  'Ahicito nomás',
  'Qué chévere',
  'Es mi lugar',
  'Plan seguro',
  'Con los panas',
  'Se viene',
  'Está bien',
];

// Elige `count` frases distintas (Fisher-Yates parcial), sin pasarse de las disponibles.
export function pickPhrases(count: number, rand: () => number = Math.random): string[] {
  const pool = [...PHRASES];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rand() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}
