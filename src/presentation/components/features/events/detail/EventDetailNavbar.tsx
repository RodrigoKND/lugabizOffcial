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

const ICON_BTN = 'flex h-11 w-11 items-center justify-center rounded-lg text-lg-dim transition-colors hover:bg-lg-surface-2 hover:text-lg-text focus-visible:outline-2 focus-visible:outline-lg-accent';

export default function EventDetailNavbar({ event, isLiked, userId, onShare, onLike, onEdit, onDelete }: EventDetailNavbarProps) {
  const goBack = useSmartBack('/');

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b-2 border-lg-surface-2 bg-lg-ground px-3 py-2 sm:px-6">
      <button onClick={goBack} className="group flex h-11 items-center gap-2 rounded-lg px-2 text-lg-dim transition-colors hover:text-lg-text focus-visible:outline-2 focus-visible:outline-lg-accent">
        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-bold">Volver</span>
      </button>
      <div className="flex gap-1">
        <button onClick={onShare} aria-label="Compartir evento" className={ICON_BTN}>
          <Share2 className="h-5 w-5" />
        </button>
        <button onClick={onLike} aria-label={isLiked ? 'Quitar me gusta' : 'Me gusta'} aria-pressed={isLiked} className={ICON_BTN}>
          <Heart className={`h-5 w-5 ${isLiked ? 'fill-lg-coral text-lg-coral' : ''}`} />
        </button>
        {userId === event.userId && (
          <>
            <button onClick={onEdit} aria-label="Editar evento" className={ICON_BTN}>
              <Pencil className="h-5 w-5" />
            </button>
            <button onClick={onDelete} aria-label="Eliminar evento" className={`${ICON_BTN} hover:!bg-lg-coral/15 hover:!text-lg-coral`}>
              <Trash2 className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
