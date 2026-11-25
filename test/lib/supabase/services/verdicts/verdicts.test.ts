import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rowsToSummaries, verdictsService } from '@/lib/supabase/services/verdicts/verdicts';

const rpc = vi.hoisted(() => vi.fn());
vi.mock('@lib/supabase', () => ({ supabase: { rpc } }));
vi.mock('@infrastructure/utils/deviceId', () => ({ getDeviceId: () => 'device-12345' }));

describe('rowsToSummaries', () => {
  it('convierte filas del RPC (los bigint llegan como texto)', () => {
    const map = rowsToSummaries([{ target_id: 'a', jallalla: '4', bien: 2, ahi: '0', mine: 'bien' }]);
    expect(map.get('a')).toEqual({ counts: { jallalla: 4, bien: 2, ahi: 0 }, mine: 'bien' });
  });

  it('descarta un voto propio desconocido', () => {
    const map = rowsToSummaries([{ target_id: 'a', jallalla: 1, bien: 0, ahi: 0, mine: 'raro' }]);
    expect(map.get('a')?.mine).toBeNull();
  });
});

describe('verdictsService.cast', () => {
  beforeEach(() => { rpc.mockReset(); });

  it('llama al RPC con el dispositivo y el veredicto', async () => {
    rpc.mockResolvedValue({ error: null });
    await verdictsService.cast('place', 'p1', 'jallalla');
    expect(rpc).toHaveBeenCalledWith('cast_verdict', {
      p_target_type: 'place', p_target_id: 'p1', p_verdict: 'jallalla', p_device_id: 'device-12345',
    });
  });

  it('null quita el voto', async () => {
    rpc.mockResolvedValue({ error: null });
    await verdictsService.cast('event', 'e1', null);
    expect(rpc).toHaveBeenCalledWith('cast_verdict', expect.objectContaining({ p_verdict: null }));
  });

  it('lanza el error del servidor para que el hook revierta', async () => {
    rpc.mockResolvedValue({ error: new Error('rls') });
    await expect(verdictsService.cast('place', 'p1', 'bien')).rejects.toThrow('rls');
  });
});
