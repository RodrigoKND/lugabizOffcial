import { X, Send, Loader2 } from 'lucide-react';
import type { EventComment } from '@lib/supabase/services/events/eventComments';
import CommentItem from './EventModalCommentItem';

interface CommentsProps {
  comments: EventComment[];
  comment: string;
  replyTo: string | null;
  sendingComment: boolean;
  user: { id: string } | null;
  onCommentChange: (value: string) => void;
  onReplyTo: (id: string | null) => void;
  onClose: () => void;
  onSend: () => void;
}

export function EventModalComments({
  comments, comment, replyTo, sendingComment, user,
  onCommentChange, onReplyTo, onClose, onSend,
}: CommentsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-sm bg-white rounded-t-2xl max-h-[50vh] flex flex-col z-30 shadow-2xl"
      onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-center py-1.5"><div className="w-8 h-1 bg-stone-300 rounded-full" /></div>
      <div className="px-4 py-2.5 border-b flex items-center justify-between">
        <h3 className="font-bold text-sm text-stone-900">{comments.length} comentarios</h3>
        <button onClick={() => { onClose(); onReplyTo(null); }}><X className="w-4 h-4 text-stone-500" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-stone-400 text-xs">Sin comentarios aún</div>
        ) : (
          comments.map(c => (
            <CommentItem key={c.id} comment={c} onReply={onReplyTo} userId={user?.id} />
          ))
        )}
      </div>
      <div className="p-3 border-t bg-white">
        {replyTo && (
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] text-stone-500">Respondiendo comentario</span>
            <button onClick={() => onReplyTo(null)} className="text-stone-400 hover:text-stone-600"><X className="w-3 h-3" /></button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input type="text" value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
            placeholder={user ? (replyTo ? 'Escribe una respuesta...' : 'Añade un comentario...') : 'Inicia sesión para comentar'}
            disabled={!user}
            className="flex-1 px-3.5 py-2 bg-stone-100 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50" />
          <button onClick={onSend} disabled={!user || !comment.trim() || sendingComment}
            className={`p-2 rounded-full transition-all ${comment.trim() && user ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-400'}`}>
            {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
