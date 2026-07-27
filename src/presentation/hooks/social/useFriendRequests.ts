import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { friendshipsService } from '@lib/supabase';
import { Friendship } from '@domain/entities';
import { useAuth } from '@presentation/context';

// Solicitudes de amistad recibidas (pending) y enviadas (pending) del usuario
// actual. Para listar amigos ya aceptados (potencialmente cientos) usar
// useFriendSearch, que resuelve filtro+límite en el servidor.
export function useFriendRequests() {
  const { user } = useAuth();
  const [pending, setPending] = useState<Friendship[]>([]);
  const [sent, setSent] = useState<Friendship[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [pendingList, sentList] = await Promise.all([
        friendshipsService.listPendingRequests(user.id),
        friendshipsService.listSentRequests(user.id),
      ]);
      setPending(pendingList);
      setSent(sentList);
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

  const cancel = useCallback(async (friendshipId: string) => {
    try {
      await friendshipsService.removeFriendship(friendshipId);
      toast.success('Solicitud cancelada');
      reload();
    } catch { toast.error('No se pudo cancelar la solicitud'); }
  }, [reload]);

  return { pending, sent, isLoading, respond, cancel, reload };
}
