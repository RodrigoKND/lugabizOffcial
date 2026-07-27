import { Check } from 'lucide-react';
import { Friendship } from '@domain/entities';

interface FriendPickerItemProps {
  friend: Friendship;
  selected: boolean;
  onToggle: () => void;
}

const FriendPickerItem: React.FC<FriendPickerItemProps> = ({ friend, selected, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors text-left ${
      selected ? 'bg-primary-50 border-primary-300' : 'bg-white border-primary-100/60 hover:bg-primary-50/40'
    }`}
  >
    {friend.otherUserAvatar ? (
      <img src={friend.otherUserAvatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
    ) : (
      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center shrink-0">
        {friend.otherUserName.charAt(0).toUpperCase()}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-text-primary truncate">{friend.otherUserName}</p>
      {friend.otherUserUsername && <p className="text-[11px] text-text-secondary truncate">@{friend.otherUserUsername}</p>}
    </div>
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
      selected ? 'bg-primary-500 border-primary-500' : 'border-primary-200'
    }`}>
      {selected && <Check className="w-3 h-3 text-white" />}
    </div>
  </button>
);

export default FriendPickerItem;
