import { describe, it, expect, vi } from 'vitest';
import { mapInsight, ownerInsightsService } from '@/lib/supabase/services/user/ownerInsights';

const rpc = vi.hoisted(() => vi.fn());
vi.mock('@lib/supabase/client', () => ({ supabase: { rpc } }));

describe('ownerInsights', () => {
  it('convierte los números que llegan como texto', () => {
    const i = mapInsight({ place_id: 'p1', name: 'Café Sol', image: null, views: '120', plans: 3, jallalla: '12', bien: 4, ahi: '0', picks: '5', picks_won: '2' });
    expect(i).toEqual({ placeId: 'p1', name: 'Café Sol', image: undefined, views: 120, plans: 3, jallalla: 12, bien: 4, ahi: 0, picks: 5, picksWon: 2 });
  });

  it('pide los últimos 30 días por defecto', async () => {
    rpc.mockResolvedValue({ data: [], error: null });
    expect(await ownerInsightsService.get()).toEqual([]);
    expect(rpc).toHaveBeenCalledWith('get_owner_insights', { p_days: 30 });
  });

  it('propaga el error para que el panel lo oculte sin romper el perfil', async () => {
    rpc.mockResolvedValue({ data: null, error: new Error('x') });
    await expect(ownerInsightsService.get()).rejects.toThrow('x');
  });
});
