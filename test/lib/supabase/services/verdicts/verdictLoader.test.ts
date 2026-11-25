import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSummaryLoader } from '@/lib/supabase/services/verdicts/verdictLoader';
import { EMPTY_VERDICT_SUMMARY, type VerdictSummary } from '@domain/entities';

const summary = (jallalla: number): VerdictSummary => ({ counts: { jallalla, bien: 0, ahi: 0 }, mine: null });

describe('createSummaryLoader', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('junta varias tarjetas en una sola petición', async () => {
    const fetchBatch = vi.fn().mockResolvedValue(new Map([['a', summary(3)], ['b', summary(5)]]));
    const loader = createSummaryLoader(fetchBatch, 25);
    const pa = loader.load('place', 'a');
    const pb = loader.load('place', 'b');
    await vi.advanceTimersByTimeAsync(25);
    expect(fetchBatch).toHaveBeenCalledTimes(1);
    expect(fetchBatch).toHaveBeenCalledWith('place', ['a', 'b']);
    expect((await pa).counts.jallalla).toBe(3);
    expect((await pb).counts.jallalla).toBe(5);
  });

  it('separa lugares y eventos en peticiones distintas', async () => {
    const fetchBatch = vi.fn().mockResolvedValue(new Map());
    const loader = createSummaryLoader(fetchBatch, 25);
    loader.load('place', 'a');
    loader.load('event', 'e');
    await vi.advanceTimersByTimeAsync(25);
    expect(fetchBatch).toHaveBeenCalledTimes(2);
  });

  it('lo que no devuelve el servidor queda en cero', async () => {
    const loader = createSummaryLoader(vi.fn().mockResolvedValue(new Map()), 25);
    const p = loader.load('place', 'sin-votos');
    await vi.advanceTimersByTimeAsync(25);
    expect(await p).toEqual(EMPTY_VERDICT_SUMMARY);
  });

  it('el mismo id no se pide dos veces mientras la caché vale', async () => {
    const fetchBatch = vi.fn().mockResolvedValue(new Map([['a', summary(1)]]));
    const loader = createSummaryLoader(fetchBatch, 25);
    loader.load('place', 'a');
    await vi.advanceTimersByTimeAsync(25);
    loader.load('place', 'a');
    await vi.advanceTimersByTimeAsync(25);
    expect(fetchBatch).toHaveBeenCalledTimes(1);
  });

  it('invalidate fuerza una nueva petición', async () => {
    const fetchBatch = vi.fn().mockResolvedValue(new Map());
    const loader = createSummaryLoader(fetchBatch, 25);
    loader.load('place', 'a');
    await vi.advanceTimersByTimeAsync(25);
    loader.invalidate('place', 'a');
    loader.load('place', 'a');
    await vi.advanceTimersByTimeAsync(25);
    expect(fetchBatch).toHaveBeenCalledTimes(2);
  });

  it('la caché vence a los 60 s', async () => {
    const fetchBatch = vi.fn().mockResolvedValue(new Map());
    const loader = createSummaryLoader(fetchBatch, 25);
    loader.load('place', 'a');
    await vi.advanceTimersByTimeAsync(25);
    await vi.advanceTimersByTimeAsync(61_000);
    loader.load('place', 'a');
    await vi.advanceTimersByTimeAsync(25);
    expect(fetchBatch).toHaveBeenCalledTimes(2);
  });

  it('si falla devuelve ceros y reintenta en la próxima carga', async () => {
    const fetchBatch = vi.fn().mockRejectedValueOnce(new Error('rpc')).mockResolvedValue(new Map([['a', summary(2)]]));
    const loader = createSummaryLoader(fetchBatch, 25);
    const first = loader.load('place', 'a');
    await vi.advanceTimersByTimeAsync(25);
    expect(await first).toEqual(EMPTY_VERDICT_SUMMARY);
    const second = loader.load('place', 'a');
    await vi.advanceTimersByTimeAsync(25);
    expect((await second).counts.jallalla).toBe(2);
  });
});
