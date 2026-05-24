import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, MapPin, Calendar, ChevronDown, Send, X } from 'lucide-react';
import { Event } from '@domain/entities';
import { eventsService } from '@lib/supabase';
import { useAuth } from '@presentation/context';
import { useEventLikes } from '@presentation/hooks/useEventLikes';
import { useEventSaves } from '@presentation/hooks/useEventSaves';
import { useEventComments } from '@presentation/hooks/useEventComments';
import { eventViewsService } from '@lib/supabase';

interface FeedEventProps {
  event: Event;
  isActive: boolean;
  onPrev: () => void;
  onNext: () => void;
  onCommentOpen: (eventId: string) => void;
  userId?: string;
}

function FeedEvent({ event, isActive, onPrev, onNext, onCommentOpen, userId }: FeedEventProps) {
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

function CommentsSheet({ eventId, userId, onClose }: { eventId: string; userId?: string; onClose: () => void }) {
  const { comments, loading, addComment } = useEventComments(eventId);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim() || !userId || sending) return;
    setSending(true);
    try {
      await addComment(userId, text.trim());
      setText('');
    } catch { }
    setSending(false);
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 z-50 h-[70vh] bg-stone-900 rounded-t-3xl overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <h3 className="text-white font-bold text-sm">Comentarios</h3>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && comments.length === 0 && (
          <div className="text-center py-10">
            <MessageCircle className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm font-medium">Sin comentarios aún</p>
            <p className="text-white/30 text-xs mt-1">Sé el primero en comentar</p>
          </div>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-stone-700 shrink-0 flex items-center justify-center">
              <span className="text-white text-xs font-bold">{c.userName.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-white text-sm font-semibold">{c.userName}</span>
                {c.isOrganizer && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">Anfitrión</span>}
              </div>
              <p className="text-white/70 text-sm">{c.text}</p>
              {c.replies && c.replies.length > 0 && (
                <div className="mt-2 pl-4 border-l border-white/10 space-y-2">
                  {c.replies.map((r) => (
                    <div key={r.id} className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-stone-700 shrink-0 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">{r.userName.charAt(0)}</span>
                      </div>
                      <div>
                        <span className="text-white text-xs font-semibold">{r.userName}</span>
                        <p className="text-white/60 text-xs">{r.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 border-t border-white/10">
        <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un comentario..."
            className="flex-1 bg-transparent text-white text-sm placeholder-white/40 outline-none"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <button onClick={handleSend} disabled={!text.trim() || !userId || sending}
            className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center disabled:opacity-40 transition-opacity">
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const EventFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const startId = searchParams.get('start');
  const { user } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [commentEventId, setCommentEventId] = useState<string | null>(null);
  const viewedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    eventsService.getEvents().then((data) => {
      setEvents(data);
      if (startId) {
        const idx = data.findIndex((e) => e.id === startId);
        if (idx >= 0) setCurrentIndex(idx);
      }
    }).finally(() => setLoading(false));
  }, [startId]);

  const markCurrentViewed = useCallback((idx: number) => {
    if (!user || !events[idx]) return;
    const id = events[idx].id;
    if (viewedRef.current.has(id)) return;
    viewedRef.current.add(id);
    eventViewsService.markAsViewed(id, user.id).catch(() => { });
  }, [user, events]);

  useEffect(() => {
    if (events.length > 0 && !loading) {
      markCurrentViewed(currentIndex);
    }
  }, [currentIndex, events, loading, markCurrentViewed]);

  const goNext = useCallback(() => {
    if (currentIndex < events.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  }, [currentIndex, events.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  }, [currentIndex]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 text-white">
        <Calendar className="w-16 h-16 text-white/20 mb-4" />
        <p className="text-lg font-bold mb-1">No hay eventos</p>
        <p className="text-white/50 text-sm">Próximamente nuevos eventos</p>
        <button onClick={() => navigate(-1)} className="mt-6 px-6 py-3 rounded-2xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors">
          Volver
        </button>
      </div>
    );
  }

  const currentEvent = events[currentIndex];

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full max-w-xs h-full md:max-h-[90vh] md:rounded-2xl overflow-hidden md:aspect-[9/16]">
        <button onClick={() => navigate(-1)} className="absolute top-6 left-4 z-30 w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center hover:bg-white/25 transition-colors">
          <ChevronDown className="w-5 h-5 text-white" />
        </button>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
          {events.slice(0, 8).map((_, idx) => (
            <div key={idx} className={`h-1 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/30'}`} />
          ))}
          {events.length > 8 && (
            <span className="text-white/40 text-[11px] ml-1 font-medium">+{events.length - 8}</span>
          )}
        </div>

        {currentEvent && (
          <FeedEvent
            key={currentEvent.id}
            event={currentEvent}
            isActive
            onPrev={goPrev}
            onNext={goNext}
            onCommentOpen={setCommentEventId}
            userId={user?.id}
          />
        )}
      </div>

      <AnimatePresence>
        {commentEventId && (
          <CommentsSheet eventId={commentEventId} userId={user?.id} onClose={() => setCommentEventId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventFeedPage;
