import { describe, it, expect, vi } from 'vitest';
import { pushSubscriptionsService } from '@/lib/supabase/services/push/pushSubscriptions';

const db = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('@lib/supabase/client', () => ({ supabase: db }));

describe('pushSubscriptionsService.saveNative', () => {
  it('guarda el token del teléfono con provider "capacitor" (el flujo web no lo borra)', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    db.from.mockReturnValue({ upsert });
    await pushSubscriptionsService.saveNative('u1', 'tok123', 'android');
    expect(db.from).toHaveBeenCalledWith('push_subscriptions');
    expect(upsert).toHaveBeenCalledWith({
      user_id: 'u1', endpoint: 'native:tok123', subscription: { type: 'native', platform: 'android' },
      provider: 'capacitor', fcm_token: 'tok123',
    }, { onConflict: 'endpoint' });
  });

  it('propaga el error para que se registre en consola', async () => {
    db.from.mockReturnValue({ upsert: vi.fn().mockResolvedValue({ error: new Error('rls') }) });
    await expect(pushSubscriptionsService.saveNative('u1', 't', 'ios')).rejects.toThrow('rls');
  });
});
