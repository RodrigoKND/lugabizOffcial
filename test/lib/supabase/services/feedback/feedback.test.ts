import { describe, it, expect, vi, beforeEach } from 'vitest';
import { feedbackService } from '@/lib/supabase/services/feedback/feedback';
import { validateFeedback } from '@/domain/entities/Feedback';

const h = vi.hoisted(() => ({
  result: { data: null, error: null } as { data: unknown; error: unknown },
  calls: [] as [string, unknown[]][],
  rpc: vi.fn(),
}));
vi.mock('@lib/supabase', () => ({
  supabase: {
    rpc: h.rpc,
    from: () => {
      const b: Record<string, unknown> = {};
      for (const m of ['select', 'eq', 'lt', 'ilike', 'order', 'limit', 'insert', 'update', 'delete']) {
        b[m] = (...a: unknown[]) => { h.calls.push([m, a]); return b; };
      }
      b.then = (f: (v: unknown) => unknown, r: (e: unknown) => unknown) => Promise.resolve(h.result).then(f, r);
      return b;
    },
  },
}));

const row = (id: string, at: string) => ({
  id, user_id: 'u', type: 'idea', message: 'hola mundo', rating: null, page: '/', status: 'nuevo',
  created_at: at, user: { name: 'Ana', avatar: null },
});

beforeEach(() => { h.calls = []; h.result = { data: null, error: null }; });

describe('validateFeedback', () => {
  it('rechaza mensajes cortos, largos o vacíos', () => {
    expect(validateFeedback('  hi ')).not.toBeNull();
    expect(validateFeedback('x'.repeat(1001))).not.toBeNull();
    expect(validateFeedback('')).not.toBeNull();
  });
  it('acepta mensajes dentro del rango', () => {
    expect(validateFeedback('Me gustaría ver más peñas')).toBeNull();
  });
});

describe('feedbackService.list', () => {
  it('pide una fila más para saber si hay otra página y devuelve el cursor', async () => {
    h.result = { data: [row('1', '2026-11-05'), row('2', '2026-11-04'), row('3', '2026-11-03')], error: null };
    const page = await feedbackService.list({ limit: 2 });
    expect(page.items.map(i => i.id)).toEqual(['1', '2']);
    expect(page.nextCursor).toBe('2026-11-04');
    expect(h.calls).toContainEqual(['limit', [3]]);
  });

  it('sin más filas no hay cursor', async () => {
    h.result = { data: [row('1', '2026-11-05')], error: null };
    expect((await feedbackService.list({ limit: 20 })).nextCursor).toBeNull();
  });

  it('aplica filtros, cursor y escapa los comodines de la búsqueda', async () => {
    h.result = { data: [], error: null };
    await feedbackService.list({ status: 'nuevo', type: 'idea', search: '50%_off', cursor: '2026-11-01' });
    expect(h.calls).toContainEqual(['eq', ['status', 'nuevo']]);
    expect(h.calls).toContainEqual(['eq', ['type', 'idea']]);
    expect(h.calls).toContainEqual(['lt', ['created_at', '2026-11-01']]);
    expect(h.calls).toContainEqual(['ilike', ['message', '%50\\%\\_off%']]);
  });

  it('propaga el error', async () => {
    h.result = { data: null, error: { message: 'rls' } };
    await expect(feedbackService.list({})).rejects.toBeTruthy();
  });
});

describe('feedbackService.stats', () => {
  it('completa con ceros los estados sin filas', async () => {
    h.rpc.mockResolvedValue({ data: [{ status: 'nuevo', total: 4 }, { status: 'hecho', total: '2' }], error: null });
    expect(await feedbackService.stats()).toEqual({ nuevo: 4, visto: 0, planeado: 0, hecho: 2, archivado: 0 });
  });
});
