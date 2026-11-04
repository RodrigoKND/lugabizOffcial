import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@presentation/context';
import { useLockBodyScroll } from '@presentation/hooks';
import { feedbackService } from '@lib/supabase/services/feedback/feedback';
import { FEEDBACK_MAX, FEEDBACK_TYPES, validateFeedback, type FeedbackType } from '@domain/entities/Feedback';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Modal de opinión: tipo, mensaje y valoración opcional. Requiere sesión para poder enviarlo.
const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  useLockBodyScroll(isOpen);
  const [type, setType] = useState<FeedbackType>('idea');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number | undefined>();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const close = () => { onClose(); setSent(false); };

  const send = async () => {
    if (!user) { toast.error('Inicia sesión para enviarnos tu opinión'); return; }
    const problem = validateFeedback(message);
    if (problem) { toast.error(problem); return; }
    setSending(true);
    try {
      await feedbackService.submit({ userId: user.id, type, message, rating, page: pathname });
      setSent(true); setMessage(''); setRating(undefined);
    } catch { toast.error('No se pudo enviar, intenta de nuevo'); }
    finally { setSending(false); }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={close}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md rounded-3xl bg-lg-surface p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-flyer-sm text-2xl text-lg-text">{sent ? '¡Gracias, panas!' : '¿Qué mejorarías?'}</h3>
              <button onClick={close} aria-label="Cerrar" className="p-1.5 rounded-lg hover:bg-lg-surface-2"><X className="w-4 h-4 text-lg-dim" /></button>
            </div>
            {sent ? (
              <>
                <p className="mt-3 text-sm text-lg-dim">Leemos todo lo que nos llega. Lugabiz se hace con ustedes.</p>
                <button onClick={close} className="mt-5 w-full rounded-full bg-lg-accent py-2.5 text-sm font-extrabold text-lg-ink">Listo</button>
              </>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {FEEDBACK_TYPES.map(t => (
                    <button key={t.id} onClick={() => setType(t.id)} aria-pressed={type === t.id}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${type === t.id ? 'bg-lg-accent text-lg-ink' : 'bg-lg-surface-2 text-lg-dim hover:text-lg-text'}`}>{t.label}</button>
                  ))}
                </div>
                <div>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} maxLength={FEEDBACK_MAX} aria-label="Tu opinión"
                    placeholder="Cuéntanos qué te gustaría ver, qué falla o qué te encanta..."
                    className="w-full resize-none rounded-2xl bg-lg-surface-2 p-3 text-sm text-lg-text outline-none border border-lg-surface-2 focus:border-lg-accent" />
                  <p className="text-right text-[11px] text-lg-dim">{message.length}/{FEEDBACK_MAX}</p>
                </div>
                <div className="flex items-center gap-1" role="group" aria-label="Valoración">
                  <span className="text-xs text-lg-dim mr-2">¿Qué tal te va?</span>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setRating(r => (r === n ? undefined : n))} aria-label={`${n} de 5`} aria-pressed={rating === n}>
                      <Star className={`w-5 h-5 ${rating && n <= rating ? 'fill-lg-accent text-lg-accent' : 'text-lg-dim'}`} />
                    </button>
                  ))}
                </div>
                <button onClick={send} disabled={sending}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-lg-accent py-3 text-sm font-extrabold text-lg-ink hover:brightness-110 disabled:opacity-60">
                  {sending && <Loader2 className="w-4 h-4 animate-spin" />} Enviar opinión
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default FeedbackModal;
