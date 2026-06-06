import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Send, Flag, Loader2 } from 'lucide-react';
import { useEventComments } from '@presentation/hooks/useEventComments';
import { reportsService } from '@lib/supabase';
import toast from 'react-hot-toast';

interface CommentsSheetProps {
  eventId: string;
  userId?: string;
  onClose: () => void;
}

const REPORT_REASONS = [
  'Comentario ofensivo',
  'Spam',
  'Información falsa',
  'Contenido inapropiado',
  'Otro',
];

export function CommentsSheet({ eventId, userId, onClose }: CommentsSheetProps) {
  const { comments, loading, addComment } = useEventComments(eventId);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

  const handleSend = async () => {
    if (!text.trim() || !userId || sending) return;
    setSending(true);
    try {
      await addComment(userId, text.trim());
      setText('');
    } catch { }
    setSending(false);
  };

  const handleReport = async () => {
    if (!userId || !reportReason || !reportId) return;
    setReporting(true);
    try {
      await reportsService.createReport({
        targetType: 'event_comment',
        targetId: reportId,
        reporterId: userId,
        reason: reportReason,
      });
      toast.success('Reporte enviado');
      setReportId(null);
      setReportReason('');
    } catch { toast.error('Error al reportar'); }
    setReporting(false);
  };

  return (
    <>
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
                <div className="flex items-center gap-2 mt-1">
                  {userId && userId !== c.userId && (
                    <button onClick={() => setReportId(c.id)}
                      className="text-[10px] text-white/30 hover:text-red-400 transition-colors flex items-center gap-0.5">
                      <Flag className="w-2.5 h-2.5" /> Reportar
                    </button>
                  )}
                </div>
                {c.replies && c.replies.length > 0 && (
                  <div className="mt-2 pl-4 border-l border-white/10 space-y-2">
                    {c.replies.map((r) => (
                      <div key={r.id} className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-stone-700 shrink-0 flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">{r.userName.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-white text-xs font-semibold">{r.userName}</span>
                            {userId && userId !== r.userId && (
                              <button onClick={() => setReportId(r.id)}
                                className="text-[9px] text-white/20 hover:text-red-400 transition-colors ml-1">
                                <Flag className="w-2 h-2" />
                              </button>
                            )}
                          </div>
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

      {/* Report Modal */}
      <AnimatePresence>
        {reportId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4"
            onClick={() => { setReportId(null); setReportReason(''); }}>
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
                <button onClick={() => { setReportId(null); setReportReason(''); }}
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
