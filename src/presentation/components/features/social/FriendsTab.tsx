import { useState } from 'react';
import { Users, UserPlus, ShieldCheck } from 'lucide-react';
import { useFriendRequests } from '@presentation/hooks';
import { useAuth } from '@presentation/context';
import FriendRequestItem from './FriendRequestItem';
import AddFriendModal from './AddFriendModal';

const FriendsTab: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { pending, friends, isLoading, respond } = useFriendRequests();
  const [showAddFriend, setShowAddFriend] = useState(false);

  const isEmpty = !isLoading && pending.length === 0 && friends.length === 0;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-4 border border-primary-100/40">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-primary-500" />
          <h4 className="text-sm font-bold text-text-primary">Privacidad</h4>
        </div>
        <label className="flex items-center justify-between py-1.5 cursor-pointer">
          <span className="text-xs text-text-secondary">Aparecer en la búsqueda por @usuario</span>
          <input
            type="checkbox"
            checked={user?.searchable ?? true}
            onChange={(e) => updateProfile({ searchable: e.target.checked })}
            className="w-4 h-4 accent-primary-500"
          />
        </label>
        <label className="flex items-center justify-between py-1.5 cursor-pointer">
          <span className="text-xs text-text-secondary">Permitir solicitudes de cualquiera</span>
          <input
            type="checkbox"
            checked={(user?.whoCanRequest ?? 'everyone') === 'everyone'}
            onChange={(e) => updateProfile({ whoCanRequest: e.target.checked ? 'everyone' : 'nobody' })}
            className="w-4 h-4 accent-primary-500"
          />
        </label>
      </div>

      <button
        onClick={() => setShowAddFriend(true)}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all"
      >
        <UserPlus className="w-4 h-4" /> Agregar amigos
      </button>

      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide px-1">
            {pending.length} {pending.length === 1 ? 'solicitud' : 'solicitudes'}
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

      <div className="space-y-2">
        <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide px-1">
          {friends.length} {friends.length === 1 ? 'amigo' : 'amigos'}
        </p>
        {friends.length === 0 && !isLoading ? (
          isEmpty && pending.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-primary-100/40">
              <Users className="w-9 h-9 text-primary-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-text-primary mb-1">Todavía no tenés amigos</h3>
              <p className="text-xs text-text-secondary">Agregalos por su @usuario para poder invitarlos a tus planes.</p>
            </div>
          ) : null
        ) : (
          <div className="space-y-2">
            {friends.map((friend) => (
              <div key={friend.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-primary-100/60 bg-white">
                {friend.otherUserAvatar ? (
                  <img src={friend.otherUserAvatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center shrink-0">
                    {friend.otherUserName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{friend.otherUserName}</p>
                  {friend.otherUserUsername && <p className="text-[11px] text-text-secondary truncate">@{friend.otherUserUsername}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddFriendModal isOpen={showAddFriend} onClose={() => setShowAddFriend(false)} />
    </div>
  );
};

export default FriendsTab;
