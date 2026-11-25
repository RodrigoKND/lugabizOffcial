import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGroupPick } from '@/presentation/hooks/social/useGroupPick';
import { useCreateGroupPick } from '@/presentation/hooks/social/useCreateGroupPick';
import type { GroupPickDetail } from '@domain/entities';

const svc = vi.hoisted(() => ({ getDetail: vi.fn(), vote: vi.fn(), decide: vi.fn(), cancel: vi.fn(), addOption: vi.fn(), create: vi.fn() }));
vi.mock('@lib/supabase/services/social/groupPicks', () => ({ groupPicksService: svc }));
vi.mock('@presentation/context', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }));
vi.mock('react-hot-toast', () => ({ default: Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }) }));

const future = () => new Date(Date.now() + 3600_000);
const detail = (extra: Partial<GroupPickDetail> = {}): GroupPickDetail => ({
  pick: { id: 'k1', createdBy: 'u1', planDate: '2026-12-05', planTime: '20:00', status: 'open', closesAt: future() },
  members: [{ userId: 'u1', name: 'Ana' }, { userId: 'u2', name: 'Beto' }],
  options: [
    { id: 'a', placeId: 'p1', addedBy: 'u1', position: 0, name: 'Café Sol' },
    { id: 'b', placeId: 'p2', addedBy: 'u1', position: 1, name: 'Bar Luna' },
  ],
  votes: [{ optionId: 'b', userId: 'u2', verdict: 'jallalla' }],
  ...extra,
});

describe('useGroupPick', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.getDetail.mockResolvedValue(detail());
    svc.vote.mockResolvedValue(undefined);
  });

  it('carga la votación y calcula puntajes y ganador', async () => {
    const { result } = renderHook(() => useGroupPick('k1'));
    await waitFor(() => expect(result.current.detail).not.toBeNull());
    expect(result.current.isCreator).toBe(true);
    expect(result.current.isOpen).toBe(true);
    expect(result.current.winnerId).toBe('b');
    expect(result.current.isComplete).toBe(false);
  });

  it('votar suma al instante y llama al servicio', async () => {
    const { result } = renderHook(() => useGroupPick('k1'));
    await waitFor(() => expect(result.current.detail).not.toBeNull());
    await act(async () => { await result.current.vote('a', 'jallalla'); });
    expect(result.current.myVotes).toEqual({ a: 'jallalla' });
    expect(svc.vote).toHaveBeenCalledWith('a', 'u1', 'jallalla');
    expect(result.current.tally.find(t => t.optionId === 'a')?.score).toBe(2);
  });

  it('tocar el mismo veredicto quita el voto', async () => {
    const { result } = renderHook(() => useGroupPick('k1'));
    await waitFor(() => expect(result.current.detail).not.toBeNull());
    await act(async () => { await result.current.vote('a', 'bien'); });
    await act(async () => { await result.current.vote('a', 'bien'); });
    expect(result.current.myVotes).toEqual({});
    expect(svc.vote).toHaveBeenLastCalledWith('a', 'u1', null);
  });

  it('si falla el servidor revierte el voto', async () => {
    svc.vote.mockRejectedValue(new Error('rls'));
    const { result } = renderHook(() => useGroupPick('k1'));
    await waitFor(() => expect(result.current.detail).not.toBeNull());
    await act(async () => { await result.current.vote('a', 'bien'); });
    expect(result.current.myVotes).toEqual({});
  });

  it('está completa cuando todos votaron todo', async () => {
    svc.getDetail.mockResolvedValue(detail({ votes: ['a', 'b'].flatMap(o => ['u1', 'u2'].map(u => ({ optionId: o, userId: u, verdict: 'bien' as const }))) }));
    const { result } = renderHook(() => useGroupPick('k1'));
    await waitFor(() => expect(result.current.isComplete).toBe(true));
  });

  it('una votación vencida o decidida ya no está abierta', async () => {
    svc.getDetail.mockResolvedValue(detail({ pick: { ...detail().pick, closesAt: new Date(Date.now() - 1000) } }));
    const { result } = renderHook(() => useGroupPick('k1'));
    await waitFor(() => expect(result.current.detail).not.toBeNull());
    expect(result.current.isOpen).toBe(false);
  });

  it('decidir llama al servicio y recarga', async () => {
    svc.decide.mockResolvedValue(undefined);
    const { result } = renderHook(() => useGroupPick('k1'));
    await waitFor(() => expect(result.current.detail).not.toBeNull());
    await act(async () => { await result.current.decide('b'); });
    expect(svc.decide).toHaveBeenCalledWith('k1', 'b');
    expect(svc.getDetail).toHaveBeenCalledTimes(2);
  });

  it('si no eres miembro (null) no hay detalle', async () => {
    svc.getDetail.mockResolvedValue(null);
    const { result } = renderHook(() => useGroupPick('k1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.detail).toBeNull();
  });
});

describe('useCreateGroupPick', () => {
  const friend = (id: string) => ({ id, name: id, username: id });
  const opt = (key: string) => ({ key, placeId: key, name: key });

  beforeEach(() => { vi.clearAllMocks(); svc.create.mockResolvedValue('k9'); });

  it('arranca con la opción de origen y pide lo que falta', () => {
    const { result } = renderHook(() => useCreateGroupPick(opt('p1')));
    expect(result.current.options).toHaveLength(1);
    expect(result.current.reason).toBe('Invita al menos a un amigo.');
    expect(result.current.canSubmit).toBe(false);
  });

  it('respeta los máximos de amigos y opciones y no repite opciones', () => {
    const { result } = renderHook(() => useCreateGroupPick());
    act(() => { ['a', 'b', 'c', 'd', 'e', 'f'].forEach(i => result.current.toggleInvitee(friend(i))); });
    expect(result.current.invitees).toHaveLength(5);
    act(() => { ['p1', 'p1', 'p2', 'p3', 'p4', 'p5'].forEach(k => result.current.addOption(opt(k))); });
    expect(result.current.options.map(o => o.key)).toEqual(['p1', 'p2', 'p3', 'p4']);
  });

  it('con todo listo crea la votación y avisa el id', async () => {
    const onCreated = vi.fn();
    const { result } = renderHook(() => useCreateGroupPick(opt('p1'), onCreated));
    act(() => {
      result.current.toggleInvitee(friend('u2'));
      result.current.addOption(opt('p2'));
      result.current.setPlanDate('2026-12-05');
      result.current.setPlanTime('20:00');
    });
    expect(result.current.canSubmit).toBe(true);
    await act(async () => { await result.current.submit(); });
    expect(svc.create).toHaveBeenCalledWith('u1', expect.objectContaining({ inviteeIds: ['u2'], planDate: '2026-12-05' }));
    expect(onCreated).toHaveBeenCalledWith('k9');
  });
});
