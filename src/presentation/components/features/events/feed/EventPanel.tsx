import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Bookmark, Share2, Send,
  MapPin, Clock, X, ChevronLeft, ChevronRight,
  Loader2, Calendar, Image as ImageIcon, Play,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { TikTokHeroEmbed } from '@presentation/components/reusables';
import { CommentItem } from '@presentation/components/features/events/modal/CommentItem';
import { useEventPanel } from '@presentation/hooks/events/useEventPanel';
import type { EventPanelProps } from '@domain/entities/props/EventPanelProps';

export function EventPanel({ event, userId, onClose, onPrev, onNext, hasPrev, hasNext }: EventPanelProps) {
  const { state, handlers, inputRef, commentsEndRef } = useEventPanel(event, userId, onPrev, onNext, hasPrev, hasNext);

  return (
    <div
      className="relative w-full h-full md:h-[90vh] md:max-h-[820px] md:rounded-2xl overflow-hidden bg-black md:bg-[#0a0a0a] shadow-2xl flex flex-col md:flex-row"
      onTouchStart={e => { handlers.handleTouchStart(e.touches[0].clientX); }}
      onTouchEnd={e => { handlers.handleTouchEnd(e.changedTouches[0].clientX); }}
    >
      {/* ── IMAGE PANEL ── */}
      <div className="relative w-full md:w-[58%] lg:w-[60%] h-full bg-black flex items-center justify-center overflow-hidden">

        {state.showVideo && state.tiktokId ? (
          <TikTokHeroEmbed videoId={state.tiktokId} videoUrl={event.socialLinks!.tiktok!} fallbackImageUrl={state.images[0]} />
        ) : (
          <>
            {state.images.length > 0 && !state.imgError && (
              <div
                className="absolute inset-0 bg-cover bg-center blur-3xl opacity-60 scale-110"
                style={{ backgroundImage: `url(${state.images[state.imgIdx]})` }}
              />
            )}

            {state.images.length > 1 && (
              <div className="absolute top-3 inset-x-3 flex gap-1 z-20">
                {state.images.map((_, i) => (
                  <div key={i} className="flex-1 h-0.5 rounded-full bg-white/20 overflow-hidden">
                    <div className="h-full bg-white/75 rounded-full"
                      style={{ width: i <= state.imgIdx ? '100%' : '0%', transition: 'width 0.3s' }} />
                  </div>
                ))}
              </div>
            )}

            {!state.imgLoaded && !state.imgError && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-8 h-8 border-2 border-white/10 border-t-amber-500 rounded-full animate-spin" />
              </div>
            )}
            {state.images.length === 0 || state.imgError ? (
              <div className="flex flex-col items-center gap-2 text-white/20 z-10">
                <Calendar className="w-12 h-12" />
                <p className="text-sm">{event.name}</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.img
                  key={state.imgIdx}
                  src={state.images[state.imgIdx]}
                  alt={event.name}
                  onLoad={handlers.onImageLoad}
                  onError={handlers.onImageError}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`relative z-10 w-full h-full object-contain transition-opacity drop-shadow-2xl ${state.imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
              </AnimatePresence>
            )}

            {state.images.length > 1 && state.imgIdx > 0 && (
              <button onClick={e => { e.stopPropagation(); handlers.navigatePrev(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 text-white/80 hover:bg-black/70 flex items-center justify-center backdrop-blur-sm transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {state.images.length > 1 && state.imgIdx < state.images.length - 1 && (
              <button onClick={e => { e.stopPropagation(); handlers.navigateNext(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 text-white/80 hover:bg-black/70 flex items-center justify-center backdrop-blur-sm transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        {state.tiktokId && (
          <button
            onClick={e => { e.stopPropagation(); handlers.toggleShowVideo(); }}
            className="absolute top-16 md:top-4 right-3 md:right-4 z-30 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-stone-700 shadow-md hover:bg-white transition-colors"
          >
            {state.showVideo ? <><ImageIcon className="w-3.5 h-3.5" /> Ver fotos</> : <><Play className="w-3.5 h-3.5" /> Ver video</>}
          </button>
        )}

        <div className="absolute top-0 inset-x-0 flex items-center justify-between p-3 pb-10 z-20 md:hidden bg-gradient-to-b from-black/75 via-black/30 to-transparent">
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

        <div className="md:hidden absolute bottom-0 inset-x-0 z-20 p-4 pt-14 bg-gradient-to-t from-black/90 via-black/55 to-transparent">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">{event.category?.name}</span>
          </div>
          <h3 className="text-white font-bold text-sm">{event.name}</h3>
          <p className={`text-white/70 text-xs mt-0.5 leading-relaxed ${!state.expanded ? 'line-clamp-2' : ''}`}>
            {event.description}
          </p>
          {event.description.length > 100 && (
            <button onClick={handlers.toggleExpanded} className="text-amber-400 text-[10px] font-bold mt-0.5">
              {state.expanded ? 'ver menos' : 'ver más'}
            </button>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1 text-white/50">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] truncate max-w-[130px]">{event.address}</span>
            </div>
            <div className="flex items-center gap-1 text-white/50">
              <Clock className="w-3 h-3 text-amber-400" />
              <span className="text-[10px]">{state.timeStr}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 mb-1">
            <div className="flex items-center gap-4">
              <button onClick={handlers.toggleLike} className="flex items-center gap-1">
                <Heart className={`w-5 h-5 transition-all ${state.liked ? 'fill-pink-400 text-pink-400' : 'text-white/70'}`} />
                <span className="text-[11px] text-white/60">{state.likesCount}</span>
              </button>
              <button onClick={() => handlers.setShowComments(true)} className="flex items-center gap-1">
                <MessageCircle className="w-5 h-5 text-white/70" />
                <span className="text-[11px] text-white/60">{state.comments.length}</span>
              </button>
              <button onClick={handlers.handleShare} className="flex items-center gap-1">
                <Share2 className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <button onClick={handlers.toggleSave}>
              <Bookmark className={`w-5 h-5 transition-all ${state.saved ? 'fill-amber-400 text-amber-400' : 'text-white/70'}`} />
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
        ${state.showComments
          ? 'fixed inset-x-0 bottom-0 z-30 h-[70vh] rounded-t-2xl md:h-full md:rounded-none md:static'
          : 'hidden md:flex'}
      `}>

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

        <div className="px-4 pt-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">{event.category?.name}</span>
            <span className="text-white/20">·</span>
            <span className="text-[10px] text-white/30 flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" /> {state.dateStr}
            </span>
          </div>
          <h2 className="text-white font-bold text-sm leading-snug">{event.name}</h2>
          <p className={`text-white/55 text-xs mt-1 leading-relaxed ${!state.expanded ? 'line-clamp-2' : ''}`}>
            {event.description}
          </p>
          {event.description.length > 120 && (
            <button onClick={handlers.toggleExpanded}
              className="text-amber-400 text-[10px] font-semibold hover:underline mt-0.5">
              {state.expanded ? 'ver menos' : 'ver más'}
            </button>
          )}
          <div className="flex items-center gap-3 mt-2 text-white/30 text-[10px]">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400/70" />
              <span className="truncate max-w-[140px]">{event.address}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400/70" />
              <span>{state.timeStr}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          {state.comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-white/20">
              <MessageCircle className="w-9 h-9 mb-2" />
              <p className="text-xs font-medium">Sin comentarios aún</p>
              <p className="text-[10px] mt-0.5 text-white/15">Sé el primero en comentar</p>
            </div>
          ) : (
            <div className="px-4 pb-3">
              {state.comments.map(c => (
                <CommentItem key={c.id} comment={c} onReply={t => handlers.setReplyTo(t)} userId={userId} />
              ))}
            </div>
          )}
          <div ref={commentsEndRef} />
        </div>

        <div className="border-t border-white/5 px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handlers.toggleLike} className="flex items-center gap-1.5 group">
                <Heart className={`w-5 h-5 transition-all duration-200 ${state.liked ? 'text-rose-500 fill-rose-500 scale-110' : 'text-white/50 group-hover:text-white'}`} />
                <span className="text-[11px] font-medium text-white/40">{state.likesCount}</span>
              </button>
              <button onClick={() => { handlers.setShowComments(!state.showComments); inputRef.current?.focus(); }}
                className="flex items-center gap-1.5 group">
                <MessageCircle className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                <span className="text-[11px] font-medium text-white/40">{state.comments.length}</span>
              </button>
              <button onClick={handlers.handleShare} disabled={state.sharing} className="group">
                {state.sharing
                  ? <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
                  : <Share2 className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />}
              </button>
            </div>
            <button onClick={handlers.toggleSave} className="group">
              <Bookmark className={`w-5 h-5 transition-all duration-200 ${state.saved ? 'text-amber-500 fill-amber-500' : 'text-white/50 group-hover:text-white'}`} />
            </button>
          </div>
          {state.likesCount > 0 && (
            <p className="text-white/30 text-[10px] mt-1.5">{state.likesCount} me gusta</p>
          )}
        </div>

        <AnimatePresence>
          {state.replyTo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-t border-white/5">
                <span className="text-[11px] text-white/50">
                  Respondiendo a <span className="font-bold text-amber-400">@{state.replyTo.userName}</span>
                </span>
                <button onClick={() => handlers.setReplyTo(null)} className="text-white/30 hover:text-white/60 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="border-t border-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={state.commentText}
              onChange={e => handlers.setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlers.sendComment(); } }}
              placeholder={
                !userId ? 'Inicia sesión para comentar'
                : state.replyTo ? `Responder a @${state.replyTo.userName}...`
                : 'Añade un comentario...'
              }
              disabled={!userId}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-white/25 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all disabled:opacity-40"
            />
            <button
              onClick={handlers.sendComment}
              disabled={!userId || !state.commentText.trim() || state.sending}
              className={`p-2 rounded-xl transition-all ${state.commentText.trim() && userId ? 'text-amber-400 hover:text-amber-300' : 'text-white/20'}`}
            >
              {state.sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="border-t border-white/5 px-4 py-3">
          <Link to={`/event/${event.id}`}
            className="block w-full text-center bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] transition-all">
            Asistiré
          </Link>
        </div>
      </div>

      {state.showComments && (
        <button onClick={() => handlers.setShowComments(false)} className="fixed inset-0 bg-black/50 z-20 md:hidden" />
      )}
    </div>
  );
}
