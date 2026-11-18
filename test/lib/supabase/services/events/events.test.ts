import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEvents } from '@/lib/supabase/services/events/events';

// Estado compartido del mock de Supabase (hoisted para poder usarlo en vi.mock)
const h = vi.hoisted(() => ({
  result: { data: null, error: null } as { data: unknown; error: unknown },
  builder: null as Record<string, unknown> | null,
}));

vi.mock('@lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => {
      const calls: Array<{ method: string; args: unknown[] }> = [];
      const b: Record<string, unknown> = { calls };
      for (const method of ['select', 'or', 'order']) {
        b[method] = (...args: unknown[]) => {
          calls.push({ method, args });
          return b;
        };
      }
      // Builder thenable: await devuelve h.result
      b.then = (
        onFulfilled: (value: { data: unknown; error: unknown }) => unknown,
        onRejected: (reason: unknown) => unknown,
      ) => Promise.resolve(h.result).then(onFulfilled, onRejected);
      h.builder = b;
      return b;
    }),
  },
}));

const rawEvent = {
  id: 'ev-1',
  name: 'Concierto',
  category_id: 'cat-1',
  date_start: '2026-06-05',
  user_id: 'user-1',
  is_free: true,
  event_attendance: [],
  created_at: '2026-05-01T10:00:00Z',
};

function getCalls(): Array<{ method: string; args: unknown[] }> {
  return (h.builder?.calls ?? []) as Array<{ method: string; args: unknown[] }>;
}

beforeEach(() => {
  h.result = { data: null, error: null };
  h.builder = null;
  vi.clearAllMocks();
});

describe('getEvents', () => {
  it('lanza el error de Supabase cuando la query falla', async () => {
    h.result = { data: null, error: new Error('permission denied') };

    await expect(getEvents()).rejects.toThrow('permission denied');
  });

  it('retorna [] cuando data viene null (sin lanzar)', async () => {
    h.result = { data: null, error: null };

    await expect(getEvents()).resolves.toEqual([]);
  });

  it('retorna [] cuando data viene vacío', async () => {
    h.result = { data: [], error: null };

    await expect(getEvents()).resolves.toEqual([]);
  });

  it('aplica transformEventData: snake_case → camelCase y dateStart como Date', async () => {
    h.result = { data: [rawEvent], error: null };

    const events = await getEvents();

    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('ev-1');
    expect(events[0].categoryId).toBe('cat-1');
    expect(events[0].userId).toBe('user-1');
    expect(events[0].isFree).toBe(true);
    expect(events[0].dateStart).toBeInstanceOf(Date);
  });

  it('filtra eventos futuros (date_end.gte hoy OR date_start.gte hoy)', async () => {
    h.result = { data: [], error: null };

    await getEvents();

    const today = new Date().toISOString().slice(0, 10);
    const orCall = getCalls().find(c => c.method === 'or');
    expect(orCall).toBeDefined();
    expect(orCall?.args[0]).toBe(`date_end.gte.${today},date_start.gte.${today}`);
  });

  it('ordena por date_start ascendente', async () => {
    h.result = { data: [], error: null };

    await getEvents();

    const orderCall = getCalls().find(c => c.method === 'order');
    expect(orderCall).toBeDefined();
    expect(orderCall?.args).toEqual(['date_start', { ascending: true }]);
  });

  it('consulta la tabla events', async () => {
    h.result = { data: [], error: null };

    await getEvents();

    const { supabase } = await import('@lib/supabase');
    expect(supabase.from).toHaveBeenCalledWith('events');
  });
});
