import { ArrowLeft, Share2, Heart, Pencil, Trash2 } from 'lucide-react';
import { Event } from '@domain/entities';
import { useSmartBack } from '@presentation/hooks';

interface EventDetailNavbarProps {
  event: Event;
  isLiked: boolean;
  userId?: string;
  onShare: () => void;
  onLike: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function EventDetailNavbar({ event, isLiked, userId, onShare, onLike, onEdit, onDelete }: EventDetailNavbarProps) {
  const goBack = useSmartBack('/');
  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-100 px-6 py-4 flex justify-between items-center">
      <button onClick={goBack} className="group flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-semibold">Volver</span>
      </button>
      <div className="flex gap-2">
        <button onClick={onShare} className="p-2.5 hover:bg-stone-50 rounded-xl transition-colors">
          <Share2 className="w-5 h-5 text-stone-600" />
        </button>
        <button onClick={onLike} className="p-2.5 hover:bg-stone-50 rounded-xl transition-colors">
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-400 text-red-400' : 'text-stone-600'}`} />
        </button>
        {userId === event.userId && (
          <>
            <button onClick={onEdit} className="p-2.5 hover:bg-stone-50 rounded-xl transition-colors">
              <Pencil className="w-5 h-5 text-stone-600" />
            </button>
            <button onClick={onDelete} className="p-2.5 hover:bg-red-50 rounded-xl transition-colors">
              <Trash2 className="w-5 h-5 text-red-400" />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
