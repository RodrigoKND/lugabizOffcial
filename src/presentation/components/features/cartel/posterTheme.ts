export interface PosterTheme {
  key: 'lila' | 'maiz' | 'coral' | 'crema';
  bg: string;
  ink: string;
}

// Colores planos de cartel de calle. Clases completas para que Tailwind las detecte.
export const POSTER_THEMES: PosterTheme[] = [
  { key: 'lila', bg: 'bg-lg-accent', ink: 'text-lg-ink' },
  { key: 'maiz', bg: 'bg-lg-maiz', ink: 'text-lg-ink' },
  { key: 'coral', bg: 'bg-lg-coral', ink: 'text-lg-ink' },
  { key: 'crema', bg: 'bg-lg-text', ink: 'text-lg-ink' },
];

const byKey = (key: PosterTheme['key']) => POSTER_THEMES.find(t => t.key === key)!;

const KEYWORDS: Array<[PosterTheme['key'], string[]]> = [
  ['maiz', ['comida', 'restaur', 'cafe', 'salten', 'pizz', 'helad', 'panader', 'gastro', 'cocina', 'almuerzo']],
  ['coral', ['music', 'concierto', 'fiesta', 'festival', 'teatro', 'deporte', 'feria', 'cultur']],
  ['lila', ['bar', 'noche', 'disco', 'club', 'trago', 'pena', 'karaoke']],
];

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Suma simple de códigos: estable entre sesiones, sin depender de Math.random.
const hash = (s: string) => [...s].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

// Mismo negocio, mismo color siempre: por palabra clave y, si no hay, por hash de la categoría.
export function posterTheme(category?: string): PosterTheme {
  const text = normalize(category ?? '');
  const hit = KEYWORDS.find(([, words]) => words.some(w => text.includes(w)));
  if (hit) return byKey(hit[0]);
  return POSTER_THEMES[hash(text) % POSTER_THEMES.length];
}

// Titular condensado: cuanto más largo el nombre, menor el cuerpo para que quepa en dos líneas.
// `large` es la escala de las pantallas de la cartelera.
export function headlineSize(name: string, large = false): string {
  const sizes = large
    ? ['text-5xl', 'text-4xl', 'text-3xl', 'text-2xl']
    : ['text-3xl', 'text-2xl', 'text-xl', 'text-lg'];
  const n = name.length;
  if (n <= 10) return sizes[0];
  if (n <= 18) return sizes[1];
  if (n <= 28) return sizes[2];
  return sizes[3];
}
