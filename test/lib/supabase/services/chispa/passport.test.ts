import { describe, it, expect, vi } from 'vitest';
import { passportService } from '@/lib/supabase/services/chispa/passport';

const h = vi.hoisted(() => ({ result: { data: null, error: null } as { data: unknown; error: unknown } }));
vi.mock('@lib/supabase', () => ({
  supabase: {
    from: () => {
      const b: Record<string, unknown> = {};
      for (const m of ['select', 'eq', 'order']) b[m] = () => b;
      b.then = (f: (v: unknown) => unknown, r: (e: unknown) => unknown) => Promise.resolve(h.result).then(f, r);
      return b;
    },
  },
}));

describe('passportService.getStamps', () => {
  it('deduplica por lugar y toma el nombre del join', async () => {
    h.result = {
      data: [
        { place_id: 'p1', created_at: '2026-11-03', places: { name: 'El Cristo' } },
        { place_id: 'p1', created_at: '2026-11-01', places: { name: 'El Cristo' } },
        { place_id: 'p2', created_at: '2026-11-02', places: [{ name: 'La Cancha' }] },
      ],
      error: null,
    };
    expect(await passportService.getStamps('u1')).toEqual([
      { placeId: 'p1', name: 'El Cristo', stampedAt: '2026-11-03' },
      { placeId: 'p2', name: 'La Cancha', stampedAt: '2026-11-02' },
    ]);
  });
  it('devuelve [] ante error', async () => {
    h.result = { data: null, error: { message: 'x' } };
    expect(await passportService.getStamps('u1')).toEqual([]);
  });
});
