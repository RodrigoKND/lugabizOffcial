import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminContentService } from '@/lib/supabase/services/admin/adminContent';

const h = vi.hoisted(() => ({
  result: { data: null, count: 0, error: null } as { data: unknown; count: number | null; error: unknown },
  calls: [] as [string, unknown[]][],
  table: '',
}));
vi.mock('@lib/supabase', () => ({
  supabase: {
    from: (t: string) => {
      h.table = t;
      const b: Record<string, unknown> = {};
      for (const m of ['select', 'order', 'range', 'ilike']) {
        b[m] = (...a: unknown[]) => { h.calls.push([m, a]); return b; };
      }
      b.then = (f: (v: unknown) => unknown, r: (e: unknown) => unknown) => Promise.resolve(h.result).then(f, r);
      return b;
    },
  },
}));

beforeEach(() => { h.calls = []; h.result = { data: [], count: 0, error: null }; });

describe('adminContentService.list', () => {
  it('lugares: pide la página con rango, trae imagen y devuelve el total', async () => {
    h.result = {
      data: [{ id: 'p1', name: 'Café', description: 'd', image: 'https://img/p.jpg', hidden: true, created_at: '2026-11-01', author: { name: 'Ana', avatar: 'a.png' } }],
      count: 45, error: null,
    };
    const page = await adminContentService.list('places', { page: 2 });
    expect(h.table).toBe('places');
    expect(h.calls).toContainEqual(['range', [20, 39]]);
    expect(page.total).toBe(45);
    expect(page.items[0]).toMatchObject({ id: 'p1', image: 'https://img/p.jpg', hidden: true, user_name: 'Ana', user_avatar: 'a.png' });
  });

  it('eventos: incluye la imagen y la fecha del evento (antes no se pedían)', async () => {
    h.result = {
      data: [{ id: 'e1', name: 'Feria', image: 'https://img/e.jpg', date_start: '2026-11-08', created_at: '2026-11-01', author: [{ name: 'Beto' }] }],
      count: 1, error: null,
    };
    const page = await adminContentService.list('events', { page: 1 });
    expect(h.table).toBe('events');
    const select = h.calls.find(c => c[0] === 'select')![1][0] as string;
    expect(select).toContain('image');
    expect(select).toContain('date_start');
    expect(page.items[0]).toMatchObject({ image: 'https://img/e.jpg', date_start: '2026-11-08', user_name: 'Beto' });
  });

  it('busca en el servidor y escapa los comodines', async () => {
    await adminContentService.list('places', { page: 1, search: '50%_off' });
    expect(h.calls).toContainEqual(['ilike', ['name', '%50\\%\\_off%']]);
  });

  it('reseñas buscan en el comentario', async () => {
    await adminContentService.list('reviews', { page: 1, search: 'rico' });
    expect(h.table).toBe('reviews');
    expect(h.calls).toContainEqual(['ilike', ['comment', '%rico%']]);
  });

  it('propaga el error', async () => {
    h.result = { data: null, count: null, error: { message: 'rls' } };
    await expect(adminContentService.list('places', { page: 1 })).rejects.toBeTruthy();
  });
});
