import { X } from 'lucide-react';
import { FriendOption } from '@domain/entities';

interface FriendTileProps {
  friend: FriendOption;
  onRemove?: () => void;
}

const FriendTile: React.FC<FriendTileProps> = ({ friend, onRemove }) => (
  <div className="relative group flex flex-col items-center gap-2 p-3 rounded-2xl border border-primary-100/50 bg-white hover:shadow-sm transition-shadow text-center">
    {onRemove && (
      <button onClick={onRemove} aria-label="Eliminar amigo"
        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 transition-all">
        <X className="w-3 h-3" />
      </button>
    )}
    {friend.avatar ? (
      <img src={friend.avatar} alt="" className="w-14 h-14 rounded-full object-cover" />
    ) : (
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white text-lg font-bold flex items-center justify-center">
        {friend.name.charAt(0).toUpperCase()}
      </div>
    )}
    <div className="min-w-0 w-full">
      <p className="text-xs font-semibold text-text-primary truncate">{friend.name}</p>
      {friend.username && <p className="text-[10px] text-text-secondary truncate">@{friend.username}</p>}
    </div>
  </div>
);

export default FriendTile;
