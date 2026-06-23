import React, { useState, useCallback } from 'react';
import {
  Star, MessageCircle, Send, User, Pencil, Trash2, X, Check, Loader2,
  Flag, ArrowDown, UserX, ChevronDown, ChevronUp, MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, usePlaces } from '@presentation/context';
import { Review } from '@domain/entities';
import { reportsService, reviewsService } from '@lib/supabase';
import toast from 'react-hot-toast';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';

interface ReviewSectionProps {
  placeId: string;
  reviews: Review[];
  hasMore: boolean;
  onLoadMore: () => void;
}

const REPORT_REASONS = [
  'Comentario ofensivo', 'Spam', 'Información falsa', 'Contenido inapropiado', 'Otro',
];

const REPLIES_PER_PAGE = 10;

interface ReplyState {
  loaded: boolean;
  loading: boolean;
  data: Review[];
  hasMore: boolean;
  page: number;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ placeId, reviews, hasMore, onLoadMore }) => {
  const { user } = useAuth();
  const { addReview, updateReview, deleteReview } = usePlaces();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [editHover, setEditHover] = useState(0);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [replyState, setReplyState] = useState<Record<string, ReplyState>>({});
  const [replyCounts, setReplyCounts] = useState<Record<string, number>>({});

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const [reportId, setReportId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportMode, setReportMode] = useState<'review' | 'user'>('review');
  const [reportReviewId, setReportReviewId] = useState('');
  const [reportUserId, setReportUserId] = useState('');
  const [reportUserName, setReportUserName] = useState('');

  const getReplyCount = (review: Review) => replyCounts[review.id] ?? review.replyCount ?? 0;

  const loadReplies = useCallback(async (reviewId: string, page = 0, append = false) => {
    setReplyState(prev => ({
      ...prev,
      [reviewId]: { ...(prev[reviewId] || { loaded: false, data: [], hasMore: true, page: 0 }), loading: true },
    }));
    try {
      const data = await reviewsService.getReplies(reviewId, REPLIES_PER_PAGE, page * REPLIES_PER_PAGE);
      setReplyState(prev => ({
        ...prev,
        [reviewId]: {
          loaded: true,
          loading: false,
          data: append ? [...(prev[reviewId]?.data || []), ...data] : data,
          hasMore: data.length === REPLIES_PER_PAGE,
          page,
        },
      }));
    } catch {
      setReplyState(prev => ({
        ...prev,
        [reviewId]: { ...(prev[reviewId] || { loaded: false, data: [], hasMore: false, page: 0 }), loading: false },
      }));
    }
  }, []);

  const toggleReplies = useCallback((reviewId: string) => {
    const current = replyState[reviewId];
    if (!current?.loaded) {
      loadReplies(reviewId, 0, false);
    } else {
      setReplyState(prev => {
        const next = { ...prev };
        delete next[reviewId];
        return next;
      });
    }
  }, [replyState, loadReplies]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0 || !comment.trim()) return;
    setIsSubmitting(true);
    const success = await addReview(placeId, rating, comment.trim());
    if (success) { setRating(0); setComment(''); toast.success('Reseña publicada'); }
    setIsSubmitting(false);
  };

  const startEditing = (review: Review) => {
    setEditingId(review.id); setEditRating(review.rating); setEditComment(review.comment); setEditHover(0);
  };
  const cancelEditing = () => { setEditingId(null); setEditRating(0); setEditComment(''); };

  const handleUpdate = async () => {
    if (!editingId || editRating === 0) return;
    setSavingEdit(true);
    const ok = await updateReview(editingId, editRating, editComment.trim());
    if (ok) { toast.success('Reseña actualizada'); cancelEditing(); }
    else toast.error('Error al actualizar');
    setSavingEdit(false);
  };

  const handleDelete = async (reviewId: string) => {
    setDeletingId(reviewId);
    const ok = await deleteReview(reviewId);
    if (ok) toast.success('Reseña eliminada');
    else toast.error('Error al eliminar');
    setDeletingId(null);
  };

  const handleReply = async (parentId: string) => {
    if (!user || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const newReply = await reviewsService.addReview(placeId, user.id, null, replyText.trim(), parentId);
      setReplyState(prev => {
        const current = prev[parentId];
        const updatedData = current?.loaded
          ? [...(current.data || []), { ...newReply, replyCount: 0 }]
          : [{ ...newReply, replyCount: 0 }];
        return {
          ...prev,
          [parentId]: { loaded: true, loading: false, data: updatedData, hasMore: false, page: 0 },
        };
      });
      setReplyCounts(prev => ({ ...prev, [parentId]: (prev[parentId] ?? (reviews.find(r => r.id === parentId)?.replyCount ?? 0)) + 1 }));
      setReplyText('');
      setReplyingTo(null);
      toast.success('Respuesta publicada');
    } catch (err: any) {
      toast.error(err?.message === 'Usuario suspendido' ? 'Tu cuenta ha sido suspendida' : 'Error al responder');
    }
    setSendingReply(false);
  };

  const openReportModal = (review: Review) => {
    setReportReviewId(review.id); setReportUserId(review.userId);
    setReportUserName(review.userName); setReportMode('review');
    setReportReason(''); setReportId(review.id);
  };
  const closeReportModal = () => { setReportId(null); setReportReason(''); };

  const handleReport = async () => {
    if (!user || !reportReason) return;
    const targetType = reportMode === 'user' ? 'user' : 'review';
    const targetId = reportMode === 'user' ? reportUserId : reportReviewId;
    if (!targetId) return;
    setReporting(true);
    try {
      await reportsService.createReport({ targetType, targetId, reporterId: user.id, reason: reportReason });
      toast.success('Reporte enviado. Gracias por ayudarnos a mantener la comunidad segura.');
      closeReportModal();
    } catch { toast.error('Error al enviar reporte'); }
    setReporting(false);
  };

  const renderStars = (current: number, onChange?: (v: number) => void, hover?: number, onHover?: (v: number) => void, size = 'w-8 h-8') => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onHover?.(star)}
          onMouseLeave={() => onHover?.(0)}
          className="transition-colors">
          <Star className={`${size} ${star <= (hover || current) ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'}`} />
        </button>
      ))}
    </div>
  );

  const renderReplySection = (review: Review) => {
    const rs = replyState[review.id];
    const count = getReplyCount(review);
    const isExpanded = !!rs?.loaded;
    const isLoading = rs?.loading;

    return (
      <div className="mt-2">
        {count > 0 && (
          <button
            onClick={() => toggleReplies(review.id)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-primary-400 hover:text-primary-300 transition-colors ml-13"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            <MessageSquare className="w-3 h-3" />
            {count} {count === 1 ? 'respuesta' : 'respuestas'}
          </button>
        )}

        <AnimatePresence>
          {rs?.loaded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden ml-8 mt-2 space-y-2"
            >
              {rs.data.map((reply) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/4 rounded-xl p-3 border-l-2 border-primary-400/30"
                >
                  <div className="flex items-start gap-2">
                    <img
                      loading="lazy"
                      src={reply.userAvatar || '/assets/images/avatar.png'}
                      alt={reply.userName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-white/80">{reply.userName}</span>
                        <span className="text-[10px] text-white/30">{reply.createdAt.toLocaleDateString()}</span>
                      </div>
                      <p className="text-white/60 text-sm leading-relaxed">{reply.comment}</p>
                    </div>
                  </div>
                </motion.div>
              ))}

              {rs.hasMore && (
                <button
                  onClick={() => loadReplies(review.id, rs.page + 1, true)}
                  disabled={rs.loading}
                  className="text-[11px] text-primary-400 hover:underline font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  {rs.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowDown className="w-3 h-3" />}
                  Cargar más respuestas
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderReviewCard = (review: Review) => (
    <div key={review.id}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-xl p-4 relative group border border-white/6">
        {user?.id === review.userId && !editingId && (
          <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => startEditing(review)}
              className="p-1.5 rounded-lg hover:bg-primary-500/15 text-white/30 hover:text-primary-400 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setConfirmDeleteId(review.id)} disabled={deletingId === review.id}
              className="p-1.5 rounded-lg hover:bg-red-500/15 text-white/30 hover:text-red-400 transition-colors">
              {deletingId === review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {editingId === review.id ? (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-start gap-3">
                <img loading="lazy" src={review.userAvatar || '/assets/images/avatar.png'} alt={review.userName}
                  className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="font-medium text-white/80">{review.userName}</h5>
                    <span className="text-xs text-white/35">(editando)</span>
                  </div>
                  {renderStars(editRating, setEditRating, editHover, setEditHover, 'w-5 h-5')}
                  <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/25 text-sm focus:border-primary-400/60 focus:ring-0 transition-all resize-none mt-2 outline-none"
                    rows={2} />
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={handleUpdate} disabled={savingEdit || editRating === 0}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary-500 text-white rounded-lg text-xs font-medium hover:bg-primary-600 transition-colors disabled:opacity-50">
                      {savingEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Guardar
                    </button>
                    <button onClick={cancelEditing}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/8 text-white/50 rounded-lg text-xs font-medium hover:bg-white/12 transition-colors">
                      <X className="w-3 h-3" /> Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-start space-x-3">
                <img loading="lazy" src={review.userAvatar || '/assets/images/avatar.png'} alt={review.userName}
                  className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-medium text-white/85 text-sm">{review.userName}</h5>
                    <span className="text-xs text-white/30">{review.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1 mb-1">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-white/60 text-sm">{review.comment}</p>
                  {user && (
                    <div className="flex items-center gap-3 mt-1.5">
                      <button
                        onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                        className="text-[11px] text-white/40 hover:text-primary-400 font-medium transition-colors"
                      >
                        Responder
                      </button>
                      {user.id !== review.userId && (
                        <button onClick={() => openReportModal(review)}
                          className="text-[11px] text-white/30 hover:text-red-400 font-medium transition-colors flex items-center gap-0.5">
                          <Flag className="w-2.5 h-2.5" /> Reportar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {replyingTo === review.id && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="ml-8 mt-2 mb-2">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl p-2 border border-white/10">
              <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escribe una respuesta..."
                className="flex-1 px-3 py-1.5 text-sm bg-transparent outline-none text-white placeholder:text-white/25"
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(review.id); } }} />
              <button onClick={() => handleReply(review.id)} disabled={!replyText.trim() || sendingReply}
                className="p-1.5 rounded-lg bg-primary-500 text-white disabled:opacity-40 transition-opacity">
                {sendingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => { setReplyingTo(null); setReplyText(''); }}
                className="p-1.5 rounded-lg text-white/30 hover:text-white/60">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {renderReplySection(review)}
    </div>
  );

  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
        <MessageCircle className="w-5 h-5 text-primary-400" />
        <span>Reseñas ({reviews.length})</span>
      </h3>

      {user ? (
        <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmitReview}
          className="rounded-xl p-5 mb-6 bg-white/4 border border-white/6">
          <h4 className="font-semibold text-white/60 mb-4 text-sm">Escribe una reseña</h4>
          <div className="mb-4">
            <label className="block text-white/35 text-xs font-medium mb-2">Calificación</label>
            {renderStars(rating, setRating, hoveredRating, setHoveredRating)}
          </div>
          <div className="mb-4">
            <label className="block text-white/35 text-xs font-medium mb-2">Comentario</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/25 focus:border-primary-400/60 focus:ring-0 transition-all resize-none outline-none text-sm"
              placeholder="Comparte tu experiencia en este lugar..." required />
          </div>
          <button type="submit" disabled={rating === 0 || !comment.trim() || isSubmitting}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all text-sm ${
              rating > 0 && comment.trim() && !isSubmitting
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'bg-white/8 text-white/25 cursor-not-allowed'
            }`}>
            {isSubmitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Enviando...</span></>
              : <><Send className="w-4 h-4" /><span>Publicar reseña</span></>}
          </button>
        </motion.form>
      ) : (
        <div className="bg-white/4 border border-white/6 rounded-xl p-6 mb-6 text-center">
          <User className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">Inicia sesión para escribir una reseña</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-10">
            <MessageCircle className="w-14 h-14 text-white/12 mx-auto mb-4" />
            <h4 className="text-base font-medium text-white/40 mb-1">No hay reseñas aún</h4>
            <p className="text-white/25 text-sm">Sé el primero en compartir tu experiencia</p>
          </div>
        ) : (
          <>
            {reviews.map(review => renderReviewCard(review))}
            {hasMore && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={onLoadMore}
                className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-primary-400 hover:text-primary-300 bg-primary-500/8 hover:bg-primary-500/12 rounded-xl transition-colors border border-primary-500/15">
                <ArrowDown className="w-4 h-4" />
                Cargar más reseñas
              </motion.button>
            )}
          </>
        )}
      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {reportId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={closeReportModal}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#150d2e] border border-white/8 rounded-3xl w-full max-w-sm p-6 shadow-2xl shadow-black/60">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${reportMode === 'user' ? 'bg-orange-500/15' : 'bg-red-500/15'}`}>
                  {reportMode === 'user' ? <UserX className="w-5 h-5 text-orange-400" /> : <Flag className="w-5 h-5 text-red-400" />}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{reportMode === 'user' ? 'Reportar usuario' : 'Reportar reseña'}</h3>
                  <p className="text-xs text-white/35">Ayúdanos a mantener la comunidad segura</p>
                </div>
              </div>
              <div className="flex rounded-xl bg-white/6 p-1 mb-4 gap-1">
                <button onClick={() => { setReportMode('review'); setReportReason(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${reportMode === 'review' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}>
                  <Flag className="w-3 h-3" /> Reseña
                </button>
                <button onClick={() => { setReportMode('user'); setReportReason(''); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${reportMode === 'user' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}>
                  <UserX className="w-3 h-3" />
                  <span className="truncate max-w-[90px]">@{reportUserName}</span>
                </button>
              </div>
              <label className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2 block">
                {reportMode === 'user' ? 'Motivo del reporte al usuario' : 'Motivo del reporte'}
              </label>
              <select value={reportReason} onChange={e => setReportReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary-400/60 mb-4">
                <option value="" className="bg-[#150d2e]">Seleccionar motivo...</option>
                {REPORT_REASONS.map(r => <option key={r} value={r} className="bg-[#150d2e]">{r}</option>)}
              </select>
              <div className={`border rounded-xl p-3 mb-4 ${reportMode === 'user' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                <p className={`text-xs ${reportMode === 'user' ? 'text-orange-300' : 'text-amber-300'}`}>
                  {reportMode === 'user'
                    ? `Si @${reportUserName} acumula 3 reportes, su cuenta será suspendida automáticamente.`
                    : 'Los reportes son revisados por administración. El autor podría ser suspendido.'}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={closeReportModal}
                  className="flex-1 py-2.5 bg-white/8 text-white/55 rounded-xl text-sm font-semibold hover:bg-white/12 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleReport} disabled={!reportReason || reporting}
                  className={`flex-1 py-2.5 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${reportMode === 'user' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-red-500 hover:bg-red-600'}`}>
                  {reporting ? <Loader2 className="w-4 h-4 animate-spin" /> : reportMode === 'user' ? <UserX className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
                  {reportMode === 'user' ? 'Reportar usuario' : 'Reportar reseña'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => { if (confirmDeleteId) handleDelete(confirmDeleteId); }}
        title="Eliminar reseña"
        message="¿Estás seguro de eliminar esta reseña? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default ReviewSection;
