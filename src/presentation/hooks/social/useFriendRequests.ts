import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { friendshipsService } from '@lib/supabase';
import { Friendship } from '@domain/entities';
import { useAuth } from '@presentation/context';

// Solicitudes pendientes recibidas + lista de amigos aceptados del usuario actual.
export function useFriendRequests() {
  const { user } = useAuth();
  const [pending, setPending] = useState<Friendship[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [pendingList, friendsList] = await Promise.all([
        friendshipsService.listPendingRequests(user.id),
        friendshipsService.listFriends(user.id),
      ]);
      setPending(pendingList);
      setFriends(friendsList);
    } catch (err) { console.error('[useFriendRequests:reload]', err); }
    setIsLoading(false);
  }, [user]);

  useEffect(() => { reload(); }, [reload]);

  const respond = useCallback(async (friendshipId: string, accept: boolean) => {
    try {
      await friendshipsService.respondToRequest(friendshipId, accept);
      toast.success(accept ? 'Ahora son amigos' : 'Solicitud rechazada');
      reload();
    } catch { toast.error('No se pudo procesar la solicitud'); }
  }, [reload]);

  return { pending, friends, isLoading, respond, reload };
}
