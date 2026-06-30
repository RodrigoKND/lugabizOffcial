import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Bookmark, Share2, Send,
  MapPin, Clock, X, ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEventModal } from '@presentation/hooks/events/useEventModal';
import { CountdownTimer } from './CountdownTimer';
import { CommentItem } from './CommentItem';
import type { EventModalProps } from './EventModal.types';
import { edgeService } from '@lib/supabase/services/notifications/edgeFunctions';

const EventModal: React.FC<EventModalProps> = ({ event, onClose, onNext, onPrev, hasNext, hasPrev }) => {
  const {
    user, comment, setComment, replyTo, setReplyTo,
    isExpanded, setIsExpanded, isSharing, sendingComment,
    comments, liked, likesCount, toggleLike,
    saved, toggleSave, handleShare, handleSendComment,
  } = useEventModal(event.id);

  const touchStart = useRef(0);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const eventEndHandledRef = useRef(false);
  const [showComments, setShowComments] = useState(false);

  const handleEventEnd = useCallback(() => {
    if (eventEndHandledRef.current) return;
    const key = `event_start_push_${event.id}`;
    if (localStorage.getItem(key)) return;
    eventEndHandledRef.current = true;
    localStorage.setItem(key, '1');
    edgeService.sendEventStartPush(event.id).catch(() => {});
  }, [event.id]);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const images = event.images?.length ? event.images : [event.imageUrl];
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    setImgIdx(0);
    setImgLoaded(false);
    setImgError(false);
  }, [event.id]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // Focus input when reply is set
  useEffect(() => {
    if (replyTo) inputRef.current?.focus();
  }, [replyTo]);

  const prevImage = () => {
    if (imgIdx > 0) { setImgIdx(i => i - 1); setImgLoaded(false); setImgError(false); }
    else if (hasPrev) onPrev();
  };
  const nextImage = () => {
    if (imgIdx < images.length - 1) { setImgIdx(i => i + 1); setImgLoaded(false); setImgError(false); }
    else if (hasNext) onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <div className="relative flex items-center justify-center w-full h-full max-w-5xl mx-auto">

        {hasPrev && (
          <button onClick={e => { e.stopPropagation(); onPrev(); }}
            className="hidden md:flex absolute -left-5 z-20 w-10 h-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all border border-white/10 backdrop-blur-sm shadow-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* ── Main container ── */}
        <div
          onClick={e => e.stopPropagation()}
          className="relative w-full h-full md:h-[90vh] md:max-h-[800px] md:rounded-2xl overflow-hidden bg-black md:bg-[#0a0a0a] shadow-2xl flex flex-col md:flex-row"
          onTouchStart={e => { touchStart.current = e.touches[0].clientX; }}
          onTouchEnd={e => {
            const d = touchStart.current - e.changedTouches[0].clientX;
            if (Math.abs(d) > 50) { d > 0 ? nextImage() : prevImage(); }
          }}
        >

          {/* ── IMAGE PANEL ── */}
          <div className="relative md:w-[58%] lg:w-[60%] h-[30vh] md:h-full shrink-0 bg-black flex items-center justify-center overflow-hidden">

            {/* Blurred background */}
            {images[imgIdx] && (
              <div
                className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 scale-110"
                style={{ backgroundImage: `url(${images[imgIdx]})` }}
              />
            )}

            {/* Image progress bars */}
            {images.length > 1 && (
              <div className="absolute top-3 inset-x-3 flex gap-1 z-10">
                {images.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 rounded-full bg-white/25 overflow-hidden">
                    <div className="h-full bg-white/80 rounded-full transition-all duration-300"
                      style={{ width: i === imgIdx ? '100%' : i < imgIdx ? '100%' : '0%' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Image */}
            {!imgLoaded && !imgError && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-8 h-8 border-2 border-white/10 border-t-amber-500 rounded-full animate-spin" />
              </div>
            )}
            {imgError ? (
              <div className="flex flex-col items-center gap-2 text-white/25 z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs">Imagen no disponible</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.img
                  key={imgIdx}
                  src={images[imgIdx]}
                  alt={event.title}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`relative z-10 w-full h-full object-contain ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
              </AnimatePresence>
            )}

            {/* Gallery nav */}
            {images.length > 1 && imgIdx > 0 && (
              <button onClick={e => { e.stopPropagation(); prevImage(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 text-white/80 hover:bg-black/70 flex items-center justify-center backdrop-blur-sm transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {images.length > 1 && imgIdx < images.length - 1 && (
              <button onClick={e => { e.stopPropagation(); nextImage(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 text-white/80 hover:bg-black/70 flex items-center justify-center backdrop-blur-sm transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Mobile top bar */}
            <div className="absolute top-0 inset-x-0 flex items-center justify-between p-3 pb-8 z-10 md:hidden bg-gradient-to-b from-black/75 via-black/35 to-transparent">
              <div className="flex items-center gap-2.5">
                <div className="ring-2 ring-amber-400/60 rounded-full p-[1.5px]">
                  <img src={event.organizer.avatar || '/avatar.png'} alt={event.organizer.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-black" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold drop-shadow">{event.organizer.name}</p>
                  <p className="text-white/50 text-[9px]">{event.category}</p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white/70 hover:bg-black/60 hover:text-white transition-all backdrop-blur-sm">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile bottom badge */}
            <div className="md:hidden absolute bottom-0 inset-x-0 p-3 pt-10 bg-gradient-to-t from-black/85 via-black/45 to-transparent">
              <CountdownTimer endDate={event.startDate} time={event.availableHours?.start} onExpired={handleEventEnd} variant="dark" />
              <h3 className="text-white font-bold text-sm mt-1">{event.title}</h3>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-white/50">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] truncate max-w-[130px]">{event.location}</span>
                </div>
                <div className="flex items-center gap-1 text-white/50">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px]">{event.availableHours?.start}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── SIDE PANEL ── */}
          <div className="flex-1 md:w-[42%] lg:w-[40%] flex flex-col bg-[#0a0a0a] border-l border-white/5 overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="ring-2 ring-amber-400/50 rounded-full p-[2px]">
                  <img src={event.organizer.avatar || '/avatar.png'} alt={event.organizer.name}
                    className="w-8 h-8 rounded-full object-cover" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">{event.organizer.name}</p>
                  <p className="text-white/35 text-[10px]">{event.category}</p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <div className="px-4 pt-3 pb-3 border-b border-white/5 shrink-0">
              <CountdownTimer endDate={event.startDate} time={event.availableHours?.start} onExpired={handleEventEnd} variant="dark" />
              <h2 className="text-white font-bold text-sm mt-2 leading-snug">{event.title}</h2>
              <p className={`text-white/55 text-xs mt-1 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                {event.description}
              </p>
              {event.description.length > 120 && (
                <button onClick={() => setIsExpanded(v => !v)}
                  className="text-amber-400 text-[10px] font-semibold hover:underline mt-0.5">
                  {isExpanded ? 'ver menos' : 'ver más'}
                </button>
              )}
              <div className="flex items-center gap-3 mt-2 text-white/30 text-[10px]">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400/70" />
                  <span className="truncate max-w-[140px]">{event.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400/70" />
                  <span>{event.availableHours?.start} – {event.availableHours?.end}</span>
                </div>
              </div>
            </div>

            {/* Comments list */}
            <div className="md:flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-white/20">
                  <MessageCircle className="w-9 h-9 mb-2" />
                  <p className="text-xs font-medium">Sin comentarios aún</p>
                  <p className="text-[10px] mt-0.5 text-white/15">Sé el primero en comentar</p>
                </div>
              ) : (
                <div className="px-4 pb-3">
                  {comments.map(c => (
                    <CommentItem key={c.id} comment={c} onReply={t => setReplyTo(t)} userId={user?.id} />
                  ))}
                </div>
              )}
              <div ref={commentsEndRef} />
            </div>

            {/* Actions bar */}
            <div className="border-t border-white/5 px-4 py-2.5 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={toggleLike} className="flex items-center gap-1.5 group">
                    <Heart className={`w-5 h-5 transition-all duration-200 ${liked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-white/50 group-hover:text-white'}`} />
                    <span className="text-[11px] font-medium text-white/40">{likesCount}</span>
                  </button>
                  <button onClick={() => inputRef.current?.focus()}
                    className="flex items-center gap-1.5 group">
                    <MessageCircle className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                    <span className="text-[11px] font-medium text-white/40">{comments.length}</span>
                  </button>
                  <button onClick={handleShare} disabled={isSharing} className="group">
                    {isSharing
                      ? <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
                      : <Share2 className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />}
                  </button>
                </div>
                <button onClick={toggleSave} className="group">
                  <Bookmark className={`w-5 h-5 transition-all duration-200 ${saved ? 'text-amber-500 fill-amber-500' : 'text-white/50 group-hover:text-white'}`} />
                </button>
              </div>
              <p className="text-white/40 text-[10px] mt-1.5">
                {likesCount > 0 ? `${likesCount} me gusta` : ''}
              </p>
            </div>

            {/* Reply indicator */}
            <AnimatePresence>
              {replyTo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}
                  className="overflow-hidden shrink-0"
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
            <div className="border-t border-white/5 px-4 py-3 shrink-0">
              <div className="flex items-center gap-2">
                {user?.id && (
                  <img src={(user as any).avatarUrl || '/avatar.png'} alt=""
                    className="w-7 h-7 rounded-full object-cover shrink-0" />
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
                  placeholder={
                    !user ? 'Inicia sesión para comentar'
                    : replyTo ? `Responder a @${replyTo.userName}...`
                    : 'Añade un comentario...'
                  }
                  disabled={!user}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all disabled:opacity-40"
                />
                <button
                  onClick={handleSendComment}
                  disabled={!user || !comment.trim() || sendingComment}
                  className={`p-2 rounded-xl transition-all ${comment.trim() && user ? 'text-amber-400 hover:text-amber-300' : 'text-white/20'}`}
                >
                  {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="border-t border-white/5 px-4 py-3 shrink-0">
              <Link to={`/event/${event.id}`} onClick={onClose}
                className="block w-full text-center bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] transition-all">
                Asistiré
              </Link>
            </div>
          </div>
        </div>

        {hasNext && (
          <button onClick={e => { e.stopPropagation(); onNext(); }}
            className="hidden md:flex absolute -right-5 z-20 w-10 h-10 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all border border-white/10 backdrop-blur-sm shadow-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default EventModal;
