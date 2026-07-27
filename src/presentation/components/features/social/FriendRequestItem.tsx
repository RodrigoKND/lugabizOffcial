import { Check, X } from 'lucide-react';
import { Friendship } from '@domain/entities';

interface FriendRequestItemProps {
  request: Friendship;
  onAccept: () => void;
  onReject: () => void;
}

const FriendRequestItem: React.FC<FriendRequestItemProps> = ({ request, onAccept, onReject }) => (
  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-primary-100/60 bg-white">
    {request.otherUserAvatar ? (
      <img src={request.otherUserAvatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
    ) : (
      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center shrink-0">
        {request.otherUserName.charAt(0).toUpperCase()}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-text-primary truncate">{request.otherUserName}</p>
      {request.otherUserUsername && <p className="text-[11px] text-text-secondary truncate">@{request.otherUserUsername}</p>}
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      <button onClick={onAccept} className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
        <Check className="w-4 h-4" />
      </button>
      <button onClick={onReject} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default FriendRequestItem;
