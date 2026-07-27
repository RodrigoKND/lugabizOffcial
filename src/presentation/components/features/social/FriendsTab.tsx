import { useState } from 'react';
import { Search, Settings, UserPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFriendRequests, useFriendSearch } from '@presentation/hooks';
import { friendshipsService } from '@lib/supabase';
import { FriendOption } from '@domain/entities';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import FriendRequestItem from './FriendRequestItem';
import SentRequestItem from './SentRequestItem';
import FriendTile from './FriendTile';
import AddFriendModal from './AddFriendModal';
import PrivacySettingsModal from './PrivacySettingsModal';
import PushEnableBanner from './PushEnableBanner';

const PAGE_SIZE = 30;

const FriendsTab: React.FC = () => {
  const { pending, sent, respond, cancel } = useFriendRequests();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [query, setQuery] = useState('');
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [friendToRemove, setFriendToRemove] = useState<FriendOption | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const { options: friends, isLoading, refresh } = useFriendSearch(query, pageSize);
  const hasMore = friends.length === pageSize;

  const handleConfirmRemove = async () => {
    if (!friendToRemove) return;
    setIsRemoving(true);
    try {
      await friendshipsService.removeFriendship(friendToRemove.friendshipId);
      toast.success(`Eliminaste a ${friendToRemove.name} de tus amigos`);
      refresh();
    } catch { toast.error('No se pudo eliminar al amigo'); }
    setIsRemoving(false);
    setFriendToRemove(null);
  };

  return (
    <div className="space-y-5">
      <PushEnableBanner />

      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide px-1">
            {pending.length} {pending.length === 1 ? 'solicitud recibida' : 'solicitudes recibidas'}
          </p>
          <div className="space-y-2">
            {pending.map((request) => (
              <FriendRequestItem
                key={request.id}
                request={request}
                onAccept={() => respond(request.id, true)}
                onReject={() => respond(request.id, false)}
              />
            ))}
          </div>
        </div>
      )}

      {sent.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide px-1">
            {sent.length} {sent.length === 1 ? 'solicitud enviada' : 'solicitudes enviadas'}
          </p>
          <div className="space-y-2">
            {sent.map((request) => (
              <SentRequestItem key={request.id} request={request} onCancel={() => cancel(request.id)} />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPageSize(PAGE_SIZE); }}
            placeholder="Buscar amigos..."
            className="w-full pl-10 pr-4 py-2.5 bg-primary-50/50 border border-primary-100 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-white transition-all"
          />
        </div>
        <button onClick={() => setShowAddFriend(true)} aria-label="Agregar amigos"
          className="shrink-0 w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors">
          <UserPlus className="w-4 h-4" />
        </button>
        <button onClick={() => setShowPrivacy(true)} aria-label="Privacidad"
          className="shrink-0 w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-100 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {friends.length === 0 && !isLoading ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-primary-100/40">
          <Users className="w-9 h-9 text-primary-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-text-primary mb-1">
            {query.trim() ? 'Sin resultados' : 'Todavía no tenés amigos'}
          </h3>
          <p className="text-xs text-text-secondary">
            {query.trim() ? 'Probá con otro nombre.' : 'Agregalos por su @usuario para poder invitarlos a tus planes.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {friends.map((friend) => (
              <FriendTile key={friend.friendshipId} friend={friend} onRemove={() => setFriendToRemove(friend)} />
            ))}
          </div>
          {hasMore && (
            <button onClick={() => setPageSize((s) => s + PAGE_SIZE)}
              className="w-full py-2.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Cargar más
            </button>
          )}
        </>
      )}

      <AddFriendModal isOpen={showAddFriend} onClose={() => setShowAddFriend(false)} />
      <PrivacySettingsModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <ConfirmDialog
        open={!!friendToRemove}
        onClose={() => setFriendToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Eliminar amigo"
        message={`¿Seguro que quieres eliminar a ${friendToRemove?.name} de tus amigos? Vas a tener que volver a enviarle una solicitud si querés agregarlo de nuevo.`}
        confirmLabel={isRemoving ? 'Eliminando...' : 'Eliminar'}
        variant="danger"
      />
    </div>
  );
};

export default FriendsTab;
