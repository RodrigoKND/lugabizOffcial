import { useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, MapPin, Calendar } from 'lucide-react';
import { FeedEventProps } from '@domain/entities/EventFeedTypes';
import { useEventLikes } from '@presentation/hooks/useEventLikes';
import { useEventSaves } from '@presentation/hooks/useEventSaves';

export function FeedEventCard({ event, isActive, onPrev, onNext, onCommentOpen, userId }: FeedEventProps) {
  const { liked, likesCount, toggleLike } = useEventLikes(event.id, userId);
  const { saved, toggleSave } = useEventSaves(event.id, userId);
  const dragY = useRef(0);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 80;
    if (info.offset.y < -threshold) {
      onNext();
    } else if (info.offset.y > threshold) {
      onPrev();
    }
  };

  return (
    <motion.div
      className="absolute inset-0"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.6}
      onDragStart={(_, info) => { dragY.current = info.point.y; }}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.25 } }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-0">
        <img
          src={event.image || 'https://images.unsplash.com/photo-1514525253361-bee8a187499b?w=800'}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent via-40% to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="absolute right-4 bottom-40 z-20 flex flex-col items-center gap-6">
        <button onClick={toggleLike} className="flex flex-col items-center gap-1 group">
          <div className={`w-12 h-12 rounded-2xl backdrop-blur-xl flex items-center justify-center transition-all duration-300 ${liked ? 'bg-pink-500/30 shadow-lg shadow-pink-500/20' : 'bg-white/15 hover:bg-white/25'}`}>
            <Heart className={`w-6 h-6 transition-all duration-300 ${liked ? 'fill-pink-400 text-pink-400 scale-110' : 'text-white'}`} />
          </div>
          <span className="text-[11px] font-semibold text-white/80">{likesCount}</span>
        </button>

        <button onClick={() => onCommentOpen(event.id)} className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-2xl backdrop-blur-xl bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-all duration-300">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[11px] font-semibold text-white/80">0</span>
        </button>

        <button onClick={toggleSave} className="flex flex-col items-center gap-1 group">
          <div className={`w-12 h-12 rounded-2xl backdrop-blur-xl flex items-center justify-center transition-all duration-300 ${saved ? 'bg-amber-500/30 shadow-lg shadow-amber-500/20' : 'bg-white/15 hover:bg-white/25'}`}>
            <Bookmark className={`w-6 h-6 transition-all duration-300 ${saved ? 'fill-amber-400 text-amber-400 scale-110' : 'text-white'}`} />
          </div>
          <span className="text-[11px] font-semibold text-white/80">{saved ? 'Guardado' : 'Guardar'}</span>
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-10">
        <div className="flex items-center gap-2 mb-3">
          {event.category && (
            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide uppercase">
              {event.category.name}
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white/80 text-[11px] font-medium flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {new Date(event.dateStart).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
          {event.name}
        </h2>

        <p className="text-white/70 text-sm leading-relaxed line-clamp-2 mb-3">
          {event.description}
        </p>

        <div className="flex items-center gap-2 text-white/60 text-xs">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{event.address}</span>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="flex -space-x-2">
            {Array.from({ length: Math.min(event.attendeesCount || 0, 3) }).map((_, i) => (
              <div key={i} className="w-7 h-7 rounded-full border-2 border-black/40 bg-stone-600 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">+</span>
              </div>
            ))}
          </div>
          <span className="text-white/50 text-[11px] font-medium">
            {event.attendeesCount || 0} asistentes
          </span>
        </div>
      </div>

      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
          <span className="text-white text-xs font-bold">{event.name.charAt(0)}</span>
        </div>
        <span className="text-white/80 text-sm font-medium drop-shadow-sm">
          {event.user?.name || 'Organizador'}
        </span>
      </div>
    </motion.div>
  );
}
