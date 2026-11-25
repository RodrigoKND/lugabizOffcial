import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mapGroupPickDetail, mapGroupPickSummary } from '@/lib/supabase/services/social/groupPickMapper';
import { groupPicksService } from '@/lib/supabase/services/social/groupPicks';
import type { RawGroupPickDetail } from '@/lib/supabase/services/social/groupPickMapper';

const db = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));
vi.mock('@lib/supabase/client', () => ({ supabase: db }));

const RAW: RawGroupPickDetail = {
  pick: { id: 'k1', created_by: 'u1', title: 'Sábado', plan_date: '2026-12-05', plan_time: '20:00', status: 'open' as const, closes_at: '2026-12-01T20:00:00Z', winner_option_id: null },
  members: [{ user_id: 'u1', name: 'Ana', username: 'ana', avatar: null }, { user_id: 'u2', name: 'Beto', username: 'beto', avatar: 'b.png' }],
  options: [{ id: 'o1', place_id: 'p1', event_id: null, added_by: 'u1', position: 0, name: 'Café Sol', image: null }],
  votes: [{ option_id: 'o1', user_id: 'u2', verdict: 'jallalla' }],
};

describe('mapGroupPickDetail', () => {
  it('convierte el JSON del RPC a la entidad', () => {
    const d = mapGroupPickDetail(RAW)!;
    expect(d.pick).toMatchObject({ id: 'k1', createdBy: 'u1', title: 'Sábado', planDate: '2026-12-05', planTime: '20:00', status: 'open' });
    expect(d.pick.closesAt).toBeInstanceOf(Date);
    expect(d.pick.winnerOptionId).toBeUndefined();
    expect(d.members[1]).toEqual({ userId: 'u2', name: 'Beto', username: 'beto', avatar: 'b.png' });
    expect(d.options[0]).toMatchObject({ id: 'o1', placeId: 'p1', name: 'Café Sol', position: 0 });
    expect(d.options[0].eventId).toBeUndefined();
    expect(d.votes).toEqual([{ optionId: 'o1', userId: 'u2', verdict: 'jallalla' }]);
  });

  it('devuelve null si no hay datos (no es miembro o no existe)', () => {
    expect(mapGroupPickDetail(null)).toBeNull();
    expect(mapGroupPickDetail(undefined)).toBeNull();
  });

  it('descarta votos con veredicto desconocido', () => {
    const d = mapGroupPickDetail({ ...RAW, votes: [{ option_id: 'o1', user_id: 'u2', verdict: 'raro' }] })!;
    expect(d.votes).toEqual([]);
  });
});

describe('mapGroupPickSummary', () => {
  it('convierte una fila de list_my_group_picks', () => {
    const s = mapGroupPickSummary({
      id: 'k1', title: null, plan_date: '2026-12-05', plan_time: '20:00', status: 'open',
      closes_at: '2026-12-01T20:00:00Z', created_by: 'u1', creator_name: 'Ana', member_count: '3',
    });
    expect(s).toMatchObject({ id: 'k1', creatorName: 'Ana', memberCount: 3, status: 'open' });
    expect(s.title).toBeUndefined();
  });
});

describe('groupPicksService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('getDetail llama al RPC y mapea', async () => {
    db.rpc.mockResolvedValue({ data: RAW, error: null });
    const d = await groupPicksService.getDetail('k1');
    expect(db.rpc).toHaveBeenCalledWith('get_group_pick', { p_pick_id: 'k1' });
    expect(d?.pick.id).toBe('k1');
  });

  it('decide y cancel usan los RPC del creador', async () => {
    db.rpc.mockResolvedValue({ error: null });
    await groupPicksService.decide('k1', 'o1');
    expect(db.rpc).toHaveBeenCalledWith('decide_group_pick', { p_pick_id: 'k1', p_option_id: 'o1' });
    await groupPicksService.cancel('k1');
    expect(db.rpc).toHaveBeenCalledWith('cancel_group_pick', { p_pick_id: 'k1' });
  });

  it('lanza el error del servidor para que la UI revierta', async () => {
    db.rpc.mockResolvedValue({ error: new Error('no') });
    await expect(groupPicksService.decide('k1', 'o1')).rejects.toThrow('no');
  });

  it('vote con veredicto hace upsert; con null borra el voto', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const eqUser = vi.fn().mockResolvedValue({ error: null });
    const eqOption = vi.fn().mockReturnValue({ eq: eqUser });
    const del = vi.fn().mockReturnValue({ eq: eqOption });
    db.from.mockReturnValue({ upsert, delete: del });

    await groupPicksService.vote('o1', 'u1', 'bien');
    expect(db.from).toHaveBeenCalledWith('group_pick_votes');
    expect(upsert).toHaveBeenCalledWith({ option_id: 'o1', user_id: 'u1', verdict: 'bien' }, { onConflict: 'option_id,user_id' });

    await groupPicksService.vote('o1', 'u1', null);
    expect(eqOption).toHaveBeenCalledWith('option_id', 'o1');
    expect(eqUser).toHaveBeenCalledWith('user_id', 'u1');
  });
});
