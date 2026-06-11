import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Bookmark, Share2, Send,
  MapPin, Clock, X, ChevronLeft, ChevronRight,
  Loader2, Calendar,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@presentation/context';
import { useEventFeed } from '@presentation/hooks/events/useEventFeed';
import { useEventViewTracker } from '@presentation/hooks/events/useEventViewTracker';
import { useEventComments } from '@presentation/hooks/useEventComments';
import { useEventLikes } from '@presentation/hooks/useEventLikes';
import { useEventSaves } from '@presentation/hooks/useEventSaves';
import { FeedLoadingState } from '@presentation/components/features/events/feed/FeedLoadingState';
import { FeedEmptyState } from '@presentation/components/features/events/feed/FeedEmptyState';
import { CommentItem } from '@presentation/components/features/events/modal/CommentItem';
import type { Event } from '@domain/entities';
import { eventSharesService } from '@lib/supabase';
import toast from 'react-hot-toast';

type ReplyTarget = { id: string; userName: string } | null;
// ── Per-event panel (remounts on event change so hooks reset) ────────────────
interface PanelProps {
  event: Event;
  userId?: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

function EventPanel({ event, userId, onClose, onNext, onPrev, hasNext, hasPrev }: PanelProps) {
  const { liked, likesCount, toggleLike } = useEventLikes(event.id, userId);
  const { saved, toggleSave } = useEventSaves(event.id, userId);
  const { comments, addComment } = useEventComments(event.id);

  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<ReplyTarget>(null);
  const [sending, setSending] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const inputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const touchX = useRef(0);

  const images = [event.image, ...(event.gallery ?? [])].filter(Boolean) as string[];
  const dateStr = new Date(event.dateStart).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeStr = event.timeStart + (event.timeEnd ? ` – ${event.timeEnd}` : '');

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isMobile || showComments) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments, isMobile, showComments]);

  useEffect(() => {
    if (replyTo) inputRef.current?.focus();
  }, [replyTo]);

  const sendComment = useCallback(async () => {
    if (!userId || !comment.trim() || sending) return;
    setSending(true);
    const text = replyTo ? `@${replyTo.userName} ${comment.trim()}` : comment.trim();
    try {
      await addComment(userId, text, replyTo?.id);
      setComment('');
      setReplyTo(null);
    } catch { toast.error('Error al enviar comentario'); }
    setSending(false);
  }, [userId, comment, sending, replyTo, addComment]);

  const handleShare = useCallback(async () => {
    if (!userId) { toast.error('Inicia sesión para compartir'); return; }
    setSharing(true);
    try {
      const share = await eventSharesService.createShare(event.id, userId);
      await navigator.clipboard.writeText(share.sharedUrl);
      toast.success('Enlace copiado');
    } catch { toast.error('Error al compartir'); }
    setSharing(false);
  }, [userId, event.id]);

  const prevImg = () => { if (imgIdx > 0) { setImgIdx(i => i - 1); setImgLoaded(false); } else hasPrev && onPrev(); };
  const nextImg = () => { if (imgIdx < images.length - 1) { setImgIdx(i => i + 1); setImgLoaded(false); } else hasNext && onNext(); };

  return (
    <div
      className="relative w-full h-full md:h-[90vh] md:max-h-[820px] md:rounded-2xl overflow-hidden bg-black md:bg-[#0a0a0a] shadow-2xl flex flex-col md:flex-row"
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        const d = touchX.current - e.changedTouches[0].clientX;
        if (Math.abs(d) > 50) { d > 0 ? nextImg() : prevImg(); }
      }}
    >
      {/* ── IMAGE PANEL ── */}
      <div className="relative md:w-[58%] lg:w-[60%] h-[46vh] md:h-full bg-black flex items-center justify-center overflow-hidden">

        {/* Progress bars */}
        {images.length > 1 && (
          <div className="absolute top-3 inset-x-3 flex gap-1 z-10">
            {images.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full bg-white/75 rounded-full"
                  style={{ width: i <= imgIdx ? '100%' : '0%', transition: 'width 0.3s' }} />
              </div>
            ))}
          </div>
        )}

        {/* Image */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-amber-500 rounded-full animate-spin" />
          </div>
        )}
        {images.length === 0 || imgError ? (
          <div className="flex flex-col items-center gap-2 text-white/20">
            <Calendar className="w-12 h-12" />
            <p className="text-sm">{event.name}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.img
              key={imgIdx}
              src={images[imgIdx]}
              alt={event.name}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`w-full h-full object-contain transition-opacity ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </AnimatePresence>
        )}

        {/* Gallery arrows */}
        {images.length > 1 && imgIdx > 0 && (
          <button onClick={e => { e.stopPropagation(); prevImg(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 text-white/80 hover:bg-black/70 flex items-center justify-center backdrop-blur-sm transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {images.length > 1 && imgIdx < images.length - 1 && (
          <button onClick={e => { e.stopPropagation(); nextImg(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 text-white/80 hover:bg-black/70 flex items-center justify-center backdrop-blur-sm transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Mobile: top bar */}
        <div className="absolute top-0 inset-x-0 flex items-center justify-between p-3 z-10 md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="ring-2 ring-amber-400/60 rounded-full p-[1.5px]">
              <div className="w-7 h-7 rounded-full bg-stone-700 overflow-hidden ring-1 ring-black flex items-center justify-center">
                {event.user?.avatar
                  ? <img src={event.user.avatar} alt="" className="w-full h-full object-cover" />
                  : <span className="text-white text-xs font-bold">{(event.user?.name || event.name).charAt(0)}</span>}
              </div>
            </div>
            <div>
              <p className="text-white text-xs font-bold drop-shadow">{event.user?.name || 'Organizador'}</p>
              <p className="text-white/50 text-[9px]">{event.category?.name}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white/70 hover:bg-black/60 hover:text-white transition-all backdrop-blur-sm">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile: bottom info */}
        <div className="md:hidden absolute bottom-0 inset-x-0 p-4 pt-14 bg-gradient-to-t from-black/85 via-black/30 to-transparent">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">{event.category?.name}</span>
          </div>
          <h3 className="text-white font-bold text-sm">{event.name}</h3>
          <p className={`text-white/70 text-xs mt-0.5 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>
            {event.description}
          </p>
          {event.description.length > 100 && (
            <button onClick={() => setExpanded(v => !v)} className="text-amber-400 text-[10px] font-bold mt-0.5">
              {expanded ? 'ver menos' : 'ver más'}
            </button>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1 text-white/50">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] truncate max-w-[130px]">{event.address}</span>
            </div>
            <div className="flex items-center gap-1 text-white/50">
              <Clock className="w-3 h-3 text-amber-400" />
              <span className="text-[10px]">{timeStr}</span>
            </div>
          </div>

          {/* Acciones sociales — visibles en móvil */}
          <div className="flex items-center justify-between mt-2 mb-1">
            <div className="flex items-center gap-4">
              <button onClick={toggleLike} className="flex items-center gap-1">
                <Heart className={`w-5 h-5 transition-all ${liked ? 'fill-pink-400 text-pink-400' : 'text-white/70'}`} />
                <span className="text-[11px] text-white/60">{likesCount}</span>
              </button>
              <button onClick={() => setShowComments(true)} className="flex items-center gap-1">
                <MessageCircle className="w-5 h-5 text-white/70" />
                <span className="text-[11px] text-white/60">{comments.length}</span>
              </button>
              <button onClick={handleShare} className="flex items-center gap-1">
                <Share2 className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <button onClick={toggleSave}>
              <Bookmark className={`w-5 h-5 transition-all ${saved ? 'fill-amber-400 text-amber-400' : 'text-white/70'}`} />
            </button>
          </div>

          <Link to={`/event/${event?.id}`}
            className="mt-1 block w-full text-center bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 rounded-xl font-bold text-xs hover:shadow-lg active:scale-[0.98] transition-all">
            Asistiré
          </Link>
        </div>
      </div>

      {/* ── SIDE PANEL — desktop: columna derecha | mobile: overlay desde abajo ── */}
      <div className={`
        md:w-[42%] lg:w-[40%] flex flex-col bg-[#0a0a0a] border-l border-white/5
        md:relative md:translate-y-0 md:opacity-100
        ${showComments
          ? 'fixed inset-x-0 bottom-0 z-30 h-[70vh] rounded-t-2xl md:h-full md:rounded-none md:static'
          : 'hidden md:flex'}
      `}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="ring-2 ring-amber-400/50 rounded-full p-[2px]">
              <div className="w-8 h-8 rounded-full bg-stone-800 overflow-hidden flex items-center justify-center">
                {event.user?.avatar
                  ? <img src={event.user.avatar} alt="" className="w-full h-full object-cover" />
                  : <span className="text-white text-sm font-bold">{(event.user?.name || event.name).charAt(0)}</span>}
              </div>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">{event.user?.name || 'Organizador'}</p>
              <p className="text-white/35 text-[10px]">{event.category?.name}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meta */}
        <div className="px-4 pt-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">{event.category?.name}</span>
            <span className="text-white/20">·</span>
            <span className="text-[10px] text-white/30 flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" /> {dateStr}
            </span>
          </div>
          <h2 className="text-white font-bold text-sm leading-snug">{event.name}</h2>
          <p className={`text-white/55 text-xs mt-1 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>
            {event.description}
          </p>
          {event.description.length > 120 && (
            <button onClick={() => setExpanded(v => !v)}
              className="text-amber-400 text-[10px] font-semibold hover:underline mt-0.5">
              {expanded ? 'ver menos' : 'ver más'}
            </button>
          )}
          <div className="flex items-center gap-3 mt-2 text-white/30 text-[10px]">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400/70" />
              <span className="truncate max-w-[140px]">{event.address}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400/70" />
              <span>{timeStr}</span>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-white/20">
              <MessageCircle className="w-9 h-9 mb-2" />
              <p className="text-xs font-medium">Sin comentarios aún</p>
              <p className="text-[10px] mt-0.5 text-white/15">Sé el primero en comentar</p>
            </div>
          ) : (
            <div className="px-4 pb-3">
              {comments.map(c => (
                <CommentItem key={c.id} comment={c} onReply={t => setReplyTo(t)} userId={userId} />
              ))}
            </div>
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Actions */}
        <div className="border-t border-white/5 px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={toggleLike} className="flex items-center gap-1.5 group">
                <Heart className={`w-5 h-5 transition-all duration-200 ${liked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-white/50 group-hover:text-white'}`} />
                <span className="text-[11px] font-medium text-white/40">{likesCount}</span>
              </button>
              <button onClick={() => { setShowComments(v => !v); inputRef.current?.focus(); }}
                className="flex items-center gap-1.5 group">
                <MessageCircle className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                <span className="text-[11px] font-medium text-white/40">{comments.length}</span>
              </button>
              <button onClick={handleShare} disabled={sharing} className="group">
                {sharing
                  ? <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
                  : <Share2 className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />}
              </button>
            </div>
            <button onClick={toggleSave} className="group">
              <Bookmark className={`w-5 h-5 transition-all duration-200 ${saved ? 'text-amber-500 fill-amber-500' : 'text-white/50 group-hover:text-white'}`} />
            </button>
          </div>
          {likesCount > 0 && (
            <p className="text-white/30 text-[10px] mt-1.5">{likesCount} me gusta</p>
          )}
        </div>

        {/* Reply indicator */}
        <AnimatePresence>
          {replyTo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-t border-white/5">
                <span className="text-[11px] text-white/50">
                  Respondiendo a <span className="font-bold text-amber-400">@{replyTo.userName}</span>
                </span>
                <button onClick={() => setReplyTo(null)} className="text-white/30 hover:text-white/60 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comment input */}
        <div className="border-t border-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment(); } }}
              placeholder={
                !userId ? 'Inicia sesión para comentar'
                : replyTo ? `Responder a @${replyTo.userName}...`
                : 'Añade un comentario...'
              }
              disabled={!userId}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all disabled:opacity-40"
            />
            <button
              onClick={sendComment}
              disabled={!userId || !comment.trim() || sending}
              className={`p-2 rounded-xl transition-all ${comment.trim() && userId ? 'text-amber-400 hover:text-amber-300' : 'text-white/20'}`}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-white/5 px-4 py-3">
          <Link to={`/event/${event.id}`}
            className="block w-full text-center bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] transition-all">
            Asistiré
          </Link>
        </div>
      </div>

      {/* Mobile overlay — toca fuera del panel para cerrar comentarios */}
      {showComments && (
        <button onClick={() => setShowComments(false)} className="fixed inset-0 bg-black/50 z-20 md:hidden" />
      )}
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────────────────────────
const EventFeedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, currentIndex, loading, goNext, goPrev } = useEventFeed();

  useEventViewTracker(user, events, currentIndex, loading);

  if (loading) return <FeedLoadingState />;
  if (events.length === 0) return <FeedEmptyState />;

  const current = events[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-0 md:p-4"
      onClick={() => navigate(-1)}
    >
      <div
        className="relative flex items-center justify-center w-full h-full max-w-5xl mx-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Prev event arrow */}
        {currentIndex > 0 && (
          <button onClick={e => { e.stopPropagation(); goPrev(); }}
            className="hidden md:flex absolute -left-5 z-20 w-10 h-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all border border-white/10 backdrop-blur-sm shadow-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full md:rounded-2xl overflow-hidden"
          >
            <EventPanel
              event={current}
              userId={user?.id}
              onClose={() => navigate(-1)}
              onNext={goNext}
              onPrev={goPrev}
              hasNext={currentIndex < events.length - 1}
              hasPrev={currentIndex > 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Next event arrow */}
        {currentIndex < events.length - 1 && (
          <button onClick={e => { e.stopPropagation(); goNext(); }}
            className="hidden md:flex absolute -right-5 z-20 w-10 h-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all border border-white/10 backdrop-blur-sm shadow-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default EventFeedPage;
