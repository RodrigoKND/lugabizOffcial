import { useState } from 'react';
import { Flag, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EventComment } from '@lib/supabase/services/events/eventComments';
import { reportsService } from '@lib/supabase';
import toast from 'react-hot-toast';
import { REPORT_REASONS } from './reportReasons';

function CommentItem({ comment, onReply, userId }: { comment: EventComment; onReply: (id: string) => void; userId?: string }) {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

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
      <div className="flex gap-2.5">
        <img src={comment.userAvatar || '/avatar.png'} alt={comment.userName} className="w-7 h-7 rounded-full shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-xs text-stone-900">{comment.userName}</span>
            {comment.isOrganizer && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Org</span>}
          </div>
          <p className="text-xs text-stone-700 mt-0.5">{comment.text}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <button onClick={() => onReply(comment.id)} className="text-[10px] text-stone-500 hover:text-stone-700 font-medium">Responder</button>
            {userId && userId !== comment.userId && (
              <button onClick={() => setReportOpen(true)} className="text-[10px] text-stone-400 hover:text-red-500 font-medium flex items-center gap-0.5">
                <Flag className="w-2.5 h-2.5" /> Reportar
              </button>
            )}
          </div>
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-1.5 ml-2 pl-3 border-l-2 border-stone-200 space-y-1.5">
              {comment.replies.map(r => (
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

      <AnimatePresence>
        {reportOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => { setReportOpen(false); setReportReason(''); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
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

export default CommentItem;
