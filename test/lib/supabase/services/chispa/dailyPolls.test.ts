import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dailyPollsService } from '@/lib/supabase/services/chispa/dailyPolls';

const h = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock('@lib/supabase', () => ({ supabase: { rpc: h.rpc } }));

describe('dailyPollsService.getActivePoll', () => {
  beforeEach(() => vi.clearAllMocks());

  it('llama a la función automática y mapea la fila', async () => {
    h.rpc.mockResolvedValue({
      data: [{ id: 'p1', question: 'Q', option_a: 'A', option_b: 'B', closes_at: '2099-01-01' }],
      error: null,
    });
    const poll = await dailyPollsService.getActivePoll();
    expect(h.rpc).toHaveBeenCalledWith('get_or_create_daily_poll');
    expect(poll).toEqual({ id: 'p1', question: 'Q', optionA: 'A', optionB: 'B', closesAt: '2099-01-01' });
  });
  it('devuelve null si no hay banco/fila o hay error', async () => {
    h.rpc.mockResolvedValue({ data: [], error: null });
    expect(await dailyPollsService.getActivePoll()).toBeNull();
    h.rpc.mockResolvedValue({ data: null, error: { message: 'x' } });
    expect(await dailyPollsService.getActivePoll()).toBeNull();
  });
});
