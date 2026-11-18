import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDailyPoll } from '@/presentation/hooks/home/useDailyPoll';

const svc = vi.hoisted(() => ({
  getActivePoll: vi.fn(),
  getVotes: vi.fn(),
  getMyVote: vi.fn(),
  vote: vi.fn(),
}));
vi.mock('@lib/supabase/services/chispa/dailyPolls', () => ({ dailyPollsService: svc }));

const poll = { id: 'p1', question: 'Q', optionA: 'A', optionB: 'B', closesAt: '2099-01-01' };

describe('useDailyPoll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    svc.getActivePoll.mockResolvedValue(poll);
    svc.getVotes.mockResolvedValue({ votesA: 54, votesB: 46 });
    svc.getMyVote.mockResolvedValue(null);
  });

  it('carga pregunta y porcentajes', async () => {
    const { result } = renderHook(() => useDailyPoll('u1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.poll?.id).toBe('p1');
    expect(result.current.percentages).toEqual({ a: 54, b: 46, total: 100 });
  });

  it('vota de forma optimista y no permite votar dos veces', async () => {
    svc.vote.mockResolvedValue(undefined);
    const { result } = renderHook(() => useDailyPoll('u1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.vote('a'); });
    expect(result.current.myVote).toBe('a');
    expect(result.current.percentages.total).toBe(101);
    await act(async () => { await result.current.vote('b'); });
    expect(svc.vote).toHaveBeenCalledTimes(1);
  });

  it('revierte si el voto falla', async () => {
    svc.vote.mockRejectedValue(new Error('rls'));
    const { result } = renderHook(() => useDailyPoll('u1'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.vote('b'); });
    expect(result.current.myVote).toBeNull();
    expect(result.current.percentages.total).toBe(100);
  });

  it('sin usuario no vota', async () => {
    const { result } = renderHook(() => useDailyPoll(undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => { await result.current.vote('a'); });
    expect(svc.vote).not.toHaveBeenCalled();
  });
});
