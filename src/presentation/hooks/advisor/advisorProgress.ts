const PREFIX = '_lugabiz_ar:';

export interface ProgressSource {
  idea: string | null;
  location: { lat: number | null; lng: number | null };
}

// Mismo análisis (idea + zona) = mismo camino. Las coordenadas se redondean para que un pequeño cambio no lo reinicie.
export function progressKey({ idea, location }: ProgressSource): string {
  const coord = (n: number | null) => (n === null ? 'x' : n.toFixed(3));
  return `${(idea ?? '').trim().toLowerCase()}|${coord(location.lat)},${coord(location.lng)}`;
}

export function toggleDone(done: string[], id: string): string[] {
  return done.includes(id) ? done.filter(d => d !== id) : [...done, id];
}

export const firstPending = (order: string[], done: string[]) => order.find(id => !done.includes(id));

export function loadDone(key: string): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PREFIX + key) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function saveDone(key: string, done: string[]): void {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(done)); } catch { /* almacenamiento bloqueado: solo no se recuerda */ }
}
