export const MIN_SIGNALS = 5;

const W_LIKES = 0.6;
const W_CATEGORIES = 0.4;
const CLASH_PENALTY = 0.5;

export interface TasteProfile {
  // Ids de lugares/eventos que le gustan y que no le gustan.
  liked: string[];
  disliked: string[];
  // Peso por categoría (comida, noche, música…), derivado de sus "me gusta".
  categories: Record<string, number>;
}

export interface BlendResult {
  percent: number;
  enoughData: boolean;
  sharedLiked: string[];
  conflicts: string[];
}

const NOT_ENOUGH: BlendResult = { percent: 0, enoughData: false, sharedLiked: [], conflicts: [] };

const signals = (p: TasteProfile) => p.liked.length + p.disliked.length;

function jaccard(a: string[], b: string[]): number {
  const sa = new Set(a);
  const union = new Set([...a, ...b]).size;
  const inter = new Set(b.filter(x => sa.has(x))).size;
  return union === 0 ? 0 : inter / union;
}

function cosine(a: Record<string, number>, b: Record<string, number>): number {
  const dot = Object.keys(a).reduce((sum, k) => sum + a[k] * (b[k] ?? 0), 0);
  const norm = (v: Record<string, number>) => Math.sqrt(Object.values(v).reduce((s, x) => s + x * x, 0));
  const denom = norm(a) * norm(b);
  return denom === 0 ? 0 : dot / denom;
}

// Qué tan parecidos son los gustos de dos personas (0–100). Simétrica; los choques restan; con pocas señales no inventa nada.
export function blendCompatibility(a: TasteProfile, b: TasteProfile): BlendResult {
  if (signals(a) < MIN_SIGNALS || signals(b) < MIN_SIGNALS) return NOT_ENOUGH;

  const likedB = new Set(b.liked);
  const likedA = new Set(a.liked);
  const sharedLiked = a.liked.filter(id => likedB.has(id));
  const conflicts = [
    ...a.liked.filter(id => b.disliked.includes(id)),
    ...b.liked.filter(id => a.disliked.includes(id) && !likedA.has(id)),
  ];

  const base = W_LIKES * jaccard(a.liked, b.liked) + W_CATEGORIES * cosine(a.categories, b.categories);
  const clashRatio = conflicts.length / Math.max(1, sharedLiked.length + conflicts.length);
  const percent = Math.round(100 * base * (1 - CLASH_PENALTY * clashRatio));

  return { percent: Math.min(100, Math.max(0, percent)), enoughData: true, sharedLiked, conflicts };
}
