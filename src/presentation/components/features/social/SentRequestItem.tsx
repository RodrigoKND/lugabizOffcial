import { X } from 'lucide-react';
import { Friendship } from '@domain/entities';

interface SentRequestItemProps {
  request: Friendship;
  onCancel: () => void;
}

const SentRequestItem: React.FC<SentRequestItemProps> = ({ request, onCancel }) => (
  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-lg-surface-2 bg-lg-surface">
    {request.otherUserAvatar ? (
      <img src={request.otherUserAvatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
    ) : (
      <div className="w-9 h-9 rounded-full bg-lg-surface-2 text-lg-accent text-sm font-bold flex items-center justify-center shrink-0">
        {request.otherUserName.charAt(0).toUpperCase()}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-lg-text truncate">{request.otherUserName}</p>
      <p className="text-[11px] text-lg-dim">Solicitud enviada</p>
    </div>
    <button onClick={onCancel}
      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lg-surface-2 text-lg-dim text-xs font-semibold hover:bg-lg-surface-2 transition-colors">
      <X className="w-3.5 h-3.5" /> Cancelar
    </button>
  </div>
);

export default SentRequestItem;
