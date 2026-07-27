import { Loader2, UserPlus } from 'lucide-react';
import { UserSearchResult } from '@domain/entities';

interface UserSearchResultItemProps {
  result: UserSearchResult;
  onAdd: () => void;
  isSending?: boolean;
  sent?: boolean;
}

const UserSearchResultItem: React.FC<UserSearchResultItemProps> = ({ result, onAdd, isSending, sent }) => (
  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-primary-100/60 bg-white">
    {result.avatar ? (
      <img src={result.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
    ) : (
      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center shrink-0">
        {result.name.charAt(0).toUpperCase()}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-text-primary truncate">{result.name}</p>
      <p className="text-[11px] text-text-secondary truncate">@{result.username}</p>
    </div>
    <button
      type="button"
      onClick={onAdd}
      disabled={isSending || sent}
      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 ${
        sent ? 'bg-green-50 text-green-600' : 'bg-primary-500 text-white hover:bg-primary-600'
      }`}
    >
      {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
      {sent ? 'Enviada' : 'Agregar'}
    </button>
  </div>
);

export default UserSearchResultItem;
