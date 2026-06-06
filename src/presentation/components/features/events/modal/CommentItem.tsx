import { useState } from 'react';
import { Flag, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EventComment } from '@lib/supabase/services/events/eventComments';
import { reportsService } from '@lib/supabase';
import toast from 'react-hot-toast';

export type ReplyTarget = { id: string; userName: string };

interface CommentItemProps {
  comment: EventComment;
  onReply: (target: ReplyTarget) => void;
  depth?: number;
  userId?: string;
  /** ID del comentario raíz (top-level). Todas las respuestas van a este hilo. */
  rootId?: string;
}

const REPORT_REASONS = [
  'Comentario ofensivo',
  'Spam',
  'Información falsa',
  'Contenido inapropiado',
  'Otro',
];

function MentionText({ text }: { text: string }) {
  const parts = text.split(/(@\w+)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('@')
          ? <span key={i} className="font-bold text-amber-400">{p}</span>
          : <span key={i}>{p}</span>,
      )}
    </>
  );
}

export function CommentItem({ comment, onReply, depth = 0, userId, rootId }: CommentItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

  const isReply = depth > 0;
  // Todas las respuestas, incluyendo respuestas a respuestas, van al hilo raíz
  const replyTargetId = rootId ?? comment.id;

  const replyCount = comment.replies?.length ?? 0;
  // Solo mostramos respuestas anidadas en comentarios raíz (depth 0)
  const visibleReplies = depth === 0
    ? (expanded ? comment.replies : comment.replies?.slice(0, 1)) ?? []
    : [];
  const hiddenCount = replyCount - 1;

  const handleReport = async () => {
    if (!userId || !reportReason) return;
    setReporting(true);
    try {
      await reportsService.createReport({
        targetType: 'event_comment',
        targetId: comment.id,
        reporterId: userId,
        reason: reportReason,
      });
      toast.success('Reporte enviado');
      setReportOpen(false);
      setReportReason('');
    } catch { toast.error('Error al reportar'); }
    setReporting(false);
  };

  return (
    <>
      {/* Comment row */}
      <div className={`flex gap-2.5 ${isReply ? 'mt-2.5' : 'mt-3'}`}>
        <img
          src={comment.userAvatar || '/avatar.png'}
          alt={comment.userName}
          className={`${isReply ? 'w-5 h-5' : 'w-7 h-7'} rounded-full shrink-0 object-cover ring-1 ring-white/10`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className={`font-bold ${isReply ? 'text-[11px]' : 'text-xs'} text-white`}>
              {comment.userName}
            </span>
            {comment.isOrganizer && (
              <span className="text-[9px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full leading-none">
                Org
              </span>
            )}
          </div>
          <p className={`${isReply ? 'text-[11px]' : 'text-xs'} text-white/80 mt-0.5 leading-relaxed`}>
            <MentionText text={comment.text} />
          </p>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => onReply({ id: replyTargetId, userName: comment.userName })}
              className="text-[10px] font-semibold text-white/40 hover:text-white/70 transition-colors"
            >
              Responder
            </button>
            {userId && userId !== comment.userId && (
              <button
                onClick={() => setReportOpen(true)}
                className="text-[10px] font-semibold text-white/30 hover:text-red-400 transition-colors flex items-center gap-0.5"
              >
                <Flag className="w-2.5 h-2.5" /> Reportar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies section — solo en comentarios raíz */}
      {depth === 0 && replyCount > 0 && (
        <div className="ml-9">
          {visibleReplies.map(r => (
            <CommentItem
              key={r.id}
              comment={r}
              onReply={onReply}
              depth={1}
              userId={userId}
              rootId={comment.id}
            />
          ))}

          {/* Toggle: ver más / ocultar */}
          {replyCount > 1 && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1 mt-2 text-[10px] font-bold text-white/40 hover:text-amber-400 transition-colors"
            >
              {expanded ? (
                <><ChevronUp className="w-3 h-3" /> Ocultar respuestas</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> Ver {hiddenCount} {hiddenCount === 1 ? 'respuesta más' : 'respuestas más'}</>
              )}
            </button>
          )}
        </div>
      )}

      {/* Report modal */}
      <AnimatePresence>
        {reportOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4"
            onClick={() => { setReportOpen(false); setReportReason(''); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <Flag className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800">Reportar comentario</h3>
                  <p className="text-xs text-stone-400">Ayúdanos a mantener la comunidad segura</p>
                </div>
              </div>
              <select value={reportReason} onChange={e => setReportReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-red-400 mb-4">
                <option value="">Seleccionar motivo...</option>
                {REPORT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div className="flex gap-3">
                <button onClick={() => { setReportOpen(false); setReportReason(''); }}
                  className="flex-1 py-2.5 bg-stone-100 text-stone-600 rounded-xl text-sm font-semibold hover:bg-stone-200 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleReport} disabled={!reportReason || reporting}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {reporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
                  Reportar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
