import { EMPTY_VERDICT_SUMMARY, type VerdictSummary, type VerdictTarget } from '@domain/entities';

export type FetchBatch = (type: VerdictTarget, ids: string[]) => Promise<Map<string, VerdictSummary>>;

const TTL_MS = 60_000;

interface Entry { promise: Promise<VerdictSummary>; at: number }

// Junta las tarjetas que piden su resumen casi a la vez en UNA sola consulta (patrón dataloader) y cachea 60 s.
export function createSummaryLoader(fetchBatch: FetchBatch, delayMs = 25) {
  const cache = new Map<string, Entry>();
  const queue = new Map<VerdictTarget, Map<string, (s: VerdictSummary) => void>>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  async function flush() {
    timer = null;
    const batches = [...queue];
    queue.clear();
    await Promise.all(batches.map(async ([type, waiting]) => {
      let result = new Map<string, VerdictSummary>();
      let failed = false;
      try { result = await fetchBatch(type, [...waiting.keys()]); } catch { failed = true; }
      waiting.forEach((resolve, id) => {
        // Si falló, se responde en cero pero no se cachea: la próxima carga reintenta.
        if (failed) cache.delete(`${type}:${id}`);
        resolve(result.get(id) ?? EMPTY_VERDICT_SUMMARY);
      });
    }));
  }

  function load(type: VerdictTarget, id: string): Promise<VerdictSummary> {
    const key = `${type}:${id}`;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < TTL_MS) return hit.promise;

    const promise = new Promise<VerdictSummary>(resolve => {
      const forType = queue.get(type) ?? new Map<string, (s: VerdictSummary) => void>();
      forType.set(id, resolve);
      queue.set(type, forType);
      timer ??= setTimeout(flush, delayMs);
    });
    cache.set(key, { promise, at: Date.now() });
    return promise;
  }

  const invalidate = (type: VerdictTarget, id: string) => { cache.delete(`${type}:${id}`); };

  return { load, invalidate };
}
