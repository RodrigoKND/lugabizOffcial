import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2, Bookmark, MapPin, Clock, Send, MoreHorizontal, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@presentation/context';
import { eventSharesService } from '@lib/supabase';
import { CountdownTimer } from './CountdownTimer';
import { useEventComments } from '@presentation/hooks/useEventComments';
import { useEventLikes } from '@presentation/hooks/useEventLikes';
import { useEventSaves } from '@presentation/hooks/useEventSaves';

interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  likes: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  startDate: Date;
  endDate?: Date;
  availableDays?: string[];
  availableHours?: { start: string; end: string };
  category: string;
  organizer: { name: string; avatar: string; isNew: boolean };
  likes: number;
  comments: number;
}

interface EventModalProps {
  event: Event;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose, onNext, onPrev, hasNext, hasPrev }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  const { comments, addComment } = useEventComments(event.id);
  const { liked, likesCount, toggleLike } = useEventLikes(event.id, user?.id);
  const { saved, toggleSave } = useEventSaves(event.id, user?.id);

  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  const handleShare = async () => {
    if (!user) { toast.error('Inicia sesión para compartir'); return; }
    setIsSharing(true);
    try {
      const share = await eventSharesService.createShare(event.id, user.id);
      await navigator.clipboard.writeText(share.sharedUrl);
      toast.success('Enlace de invitación copiado!');
    } catch {
      toast.error('Error al compartir');
    } finally {
      setIsSharing(false);
    }
  };

  const handleSendComment = async () => {
    if (!user) { toast.error('Inicia sesión para comentar'); return; }
    if (!comment.trim() || sendingComment) return;
    setSendingComment(true);
    try {
      await addComment(user.id, comment.trim(), replyTo || undefined);
      setComment('');
      setReplyTo(null);
    } catch {
      toast.error('Error al enviar comentario');
    } finally {
      setSendingComment(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEnd.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const d = touchStart.current - touchEnd.current;
    if (Math.abs(d) > 50) {
      if (d > 0 && hasNext) onNext();
      else if (d < 0 && hasPrev) onPrev();
    }
    touchStart.current = 0;
    touchEnd.current = 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 md:p-4"
      onClick={onClose}
    >
      <div className="relative flex items-center gap-4">
        {hasPrev && (
          <button onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="hidden md:flex cursor-pointer items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/25 transition-all text-white shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative w-full max-w-sm mx-auto aspect-[9/16] md:h-[85vh] md:aspect-auto rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${event.imageUrl})`, filter: 'brightness(0.55)' }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent via-45% to-black/90" />

          <button onClick={onClose} className="absolute top-3 right-3 z-20 bg-black/40 backdrop-blur-sm p-1.5 rounded-full hover:bg-black/60 transition-all">
            <X className="w-4 h-4 text-white" />
          </button>

          <div className="relative h-full flex flex-col justify-between p-4">
            <div className="flex items-center gap-2.5">
              <div className={`p-[1.5px] rounded-full ${event.organizer.isNew ? 'bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-500' : 'bg-stone-500'}`}>
                <div className="p-[1.5px] bg-black rounded-full">
                  <img src={event.organizer.avatar || '/avatar.png'} alt={event.organizer.name} className="w-8 h-8 rounded-full object-cover" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-xs truncate">{event.organizer.name}</p>
                <p className="text-white/60 text-[10px]">{event.category}</p>
              </div>
              <button className="text-white/60 hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
            </div>

            <div className="space-y-2.5">
              <CountdownTimer endDate={event.startDate} />

              <div>
                <h3 className="text-xl font-bold text-white leading-tight">{event.title}</h3>
                <div className="relative mt-1">
                  <p className={`text-white/80 text-xs leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>{event.description}</p>
                  <div className="flex gap-2 mt-1">
                    {!isExpanded && event.description.length > 100 && (
                      <button onClick={() => setIsExpanded(true)} className="text-amber-400 text-[10px] font-bold hover:underline">ver más</button>
                    )}
                    <Link to={`/event/${event.id}`} onClick={onClose} className="text-white/50 text-[10px] font-medium hover:text-white transition-colors">detalle</Link>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 space-y-1.5 border border-white/5">
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px] font-medium truncate">{event.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/80">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px]">{event.availableHours?.start} - {event.availableHours?.end}</span>
                  </div>
                  <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-white/50 uppercase tracking-wider">{event.category}</span>
                </div>
              </div>

              <Link to={`/event/${event.id}`} onClick={onClose}
                className="block w-full text-center bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg active:scale-[0.97] transition-all">
                Asistiré
              </Link>
            </div>
          </div>

          <div className="absolute right-2 bottom-28 flex flex-col items-center gap-3">
            <button onClick={toggleLike} className="flex flex-col items-center gap-0.5">
              <div className={`p-2 rounded-full backdrop-blur-sm transition-all ${liked ? 'bg-pink-500/40' : 'bg-white/15'}`}>
                <Heart className={`w-5 h-5 ${liked ? 'text-pink-400 fill-pink-400' : 'text-white'}`} />
              </div>
              <span className="text-white text-[10px] font-bold">{likesCount}</span>
            </button>

            <button onClick={() => setShowComments(!showComments)} className="flex flex-col items-center gap-0.5">
              <div className={`p-2 rounded-full backdrop-blur-sm transition-all ${showComments ? 'bg-amber-500/40' : 'bg-white/15'}`}>
                <MessageCircle className={`w-5 h-5 ${showComments ? 'text-amber-400' : 'text-white'}`} />
              </div>
              <span className="text-white text-[10px] font-bold">{comments.length}</span>
            </button>

            <button onClick={toggleSave} className="flex flex-col items-center gap-0.5">
              <div className={`p-2 rounded-full backdrop-blur-sm transition-all ${saved ? 'bg-amber-500/40' : 'bg-white/15'}`}>
                <Bookmark className={`w-5 h-5 ${saved ? 'text-amber-400 fill-amber-400' : 'text-white'}`} />
              </div>
            </button>

            <button onClick={handleShare} disabled={isSharing} className="flex flex-col items-center gap-0.5">
              <div className="p-2 rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-all">
                {isSharing ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Share2 className="w-5 h-5 text-white" />}
              </div>
            </button>
          </div>
        </div>

        {hasNext && (
          <button onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="hidden md:flex cursor-pointer items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/25 transition-all text-white shrink-0">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {showComments && (
        <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-sm bg-white rounded-t-2xl max-h-[50vh] flex flex-col z-30 shadow-2xl"
          onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-center py-1.5"><div className="w-8 h-1 bg-stone-300 rounded-full" /></div>
          <div className="px-4 py-2.5 border-b flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900">{comments.length} comentarios</h3>
            <button onClick={() => { setShowComments(false); setReplyTo(null); }}><X className="w-4 h-4 text-stone-500" /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-6 text-stone-400 text-xs">Sin comentarios aún</div>
            ) : (
              comments.map(c => (
                <div key={c.id}>
                  <div className="flex gap-2.5">
                    <img src={c.userAvatar || '/avatar.png'} alt={c.userName} className="w-7 h-7 rounded-full shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-stone-900">{c.userName}</span>
                        {c.isOrganizer && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Org</span>}
                      </div>
                      <p className="text-xs text-stone-700 mt-0.5">{c.text}</p>
                      <button onClick={() => setReplyTo(c.id)} className="text-[10px] text-stone-500 hover:text-stone-700 font-medium mt-0.5">Responder</button>
                      {c.replies && c.replies.length > 0 && (
                        <div className="mt-1.5 ml-2 pl-3 border-l-2 border-stone-200 space-y-1.5">
                          {c.replies.map(r => (
                            <div key={r.id} className="flex gap-2">
                              <img src={r.userAvatar || '/avatar.png'} alt={r.userName} className="w-5 h-5 rounded-full shrink-0" />
                              <div>
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="font-semibold text-[11px] text-stone-900">{r.userName}</span>
                                  {r.isOrganizer && <span className="text-[8px] font-bold bg-amber-100 text-amber-700 px-1 py-0.5 rounded">Org</span>}
                                </div>
                                <p className="text-[11px] text-stone-700 mt-0.5">{r.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t bg-white">
            {replyTo && (
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[10px] text-stone-500">Respondiendo comentario</span>
                <button onClick={() => setReplyTo(null)} className="text-stone-400 hover:text-stone-600"><X className="w-3 h-3" /></button>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input type="text" value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
                placeholder={user ? (replyTo ? 'Escribe una respuesta...' : 'Añade un comentario...') : 'Inicia sesión para comentar'}
                disabled={!user}
                className="flex-1 px-3.5 py-2 bg-stone-100 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50" />
              <button onClick={handleSendComment} disabled={!user || !comment.trim() || sendingComment}
                className={`p-2 rounded-full transition-all ${comment.trim() && user ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-400'}`}>
                {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EventModal;
