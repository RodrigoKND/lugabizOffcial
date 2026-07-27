import { X } from 'lucide-react';
import { Friendship } from '@domain/entities';

interface SentRequestItemProps {
  request: Friendship;
  onCancel: () => void;
}

const SentRequestItem: React.FC<SentRequestItemProps> = ({ request, onCancel }) => (
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
      <p className="text-[11px] text-text-secondary">Solicitud enviada</p>
    </div>
    <button onClick={onCancel}
      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 text-xs font-semibold hover:bg-stone-200 transition-colors">
      <X className="w-3.5 h-3.5" /> Cancelar
    </button>
  </div>
);

export default SentRequestItem;
