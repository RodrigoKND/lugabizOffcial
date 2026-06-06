import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ThumbsUp, ThumbsDown, Star, Loader2, Send } from 'lucide-react';
import { surveysService } from '@lib/supabase';
import { useAuth } from '@presentation/context';
import toast from 'react-hot-toast';

interface PlaceSurveyModalProps {
  open: boolean;
  onClose: () => void;
  placeId: string;
  placeName: string;
}

const PlaceSurveyModal: React.FC<PlaceSurveyModalProps> = ({ open, onClose, placeId, placeName }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'enter' | 'rate' | 'recommend' | 'comment' | 'done'>('enter');
  const [isNearby, setIsNearby] = useState<boolean | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) { toast.error('Inicia sesión'); return; }
    setSubmitting(true);
    try {
      await surveysService.submitSurvey({
        userId: user.id,
        placeId,
        isNearby: isNearby === true,
        rating: rating > 0 ? rating : undefined,
        wouldRecommend: wouldRecommend === true ? true : undefined,
        comment: comment.trim() || undefined,
      });
      setStep('done');
    } catch {
      toast.error('Error al enviar');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep('enter');
    setIsNearby(null);
    setRating(0);
    setWouldRecommend(null);
    setComment('');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-stone-100"
          >
            {/* Progress dots */}
            {step !== 'done' && (
              <div className="flex gap-1.5 mb-5 justify-center">
                {['enter', 'rate', 'recommend', 'comment'].map((s) => (
                  <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${
                    ['enter', 'rate', 'recommend', 'comment'].indexOf(s) <= ['enter', 'rate', 'recommend', 'comment'].indexOf(step)
                      ? 'w-6 bg-amber-500' : 'w-1.5 bg-stone-200'
                  }`} />
                ))}
              </div>
            )}

            <button onClick={() => { reset(); onClose(); }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors">
              <X className="w-4 h-4 text-stone-500" />
            </button>

            {step === 'enter' && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-1">{placeName}</h3>
                <p className="text-sm text-stone-500 mb-6">¿Estuviste en este lugar?</p>
                <div className="flex gap-3">
                  <button onClick={() => { setIsNearby(true); setStep('rate'); }}
                    className="flex-1 py-3 rounded-2xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-all active:scale-[0.97]">
                    Sí, entré
                  </button>
                  <button onClick={() => { setIsNearby(false); setStep('rate'); }}
                    className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50 transition-all active:scale-[0.97]">
                    No, solo pasé
                  </button>
                </div>
              </div>
            )}

            {step === 'rate' && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-1">¿Qué te pareció?</h3>
                <p className="text-sm text-stone-500 mb-5">Tu opinión ayuda a otros usuarios</p>
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => { setRating(s); setStep('recommend'); }}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-all hover:scale-110 active:scale-95">
                      <Star className={`w-10 h-10 ${
                        s <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                      }`} />
                    </button>
                  ))}
                </div>
                <button onClick={() => setStep('recommend')}
                  className="text-xs text-stone-400 hover:text-stone-600 underline transition-colors">
                  Saltar
                </button>
              </div>
            )}

            {step === 'recommend' && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-1">¿Lo recomendarías?</h3>
                <p className="text-sm text-stone-500 mb-6">Tu recomendación ayuda a la comunidad</p>
                <div className="flex gap-3">
                  <button onClick={() => { setWouldRecommend(true); setStep('comment'); }}
                    className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-all active:scale-[0.97] flex items-center justify-center gap-2">
                    <ThumbsUp className="w-4 h-4" /> Sí
                  </button>
                  <button onClick={() => { setWouldRecommend(false); setStep('comment'); }}
                    className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50 transition-all active:scale-[0.97] flex items-center justify-center gap-2">
                    <ThumbsDown className="w-4 h-4" /> No
                  </button>
                </div>
              </div>
            )}

            {step === 'comment' && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-1">Algo más que agregar?</h3>
                <p className="text-sm text-stone-500 mb-5">Cuéntanos tu experiencia (opcional)</p>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-2xl text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none"
                  rows={3} placeholder="Ej. La atención fue excelente..." />
                <div className="flex gap-3 mt-4">
                  <button onClick={handleSubmit} disabled={submitting}
                    className="flex-1 py-3 rounded-2xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-all active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-50">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submitting ? 'Enviando...' : 'Enviar'}
                  </button>
                  <button onClick={handleSubmit} disabled={submitting}
                    className="py-3 px-5 rounded-2xl border border-stone-200 text-stone-500 text-sm font-medium hover:bg-stone-50 transition-all">
                    Saltar
                  </button>
                </div>
              </div>
            )}

            {step === 'done' && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-1">¡Gracias por tu opinión!</h3>
                <p className="text-sm text-stone-500 mb-6">Tu feedback ayuda a mejorar la comunidad</p>
                <button onClick={() => { reset(); onClose(); }}
                  className="w-full py-3 rounded-2xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-all">
                  Cerrar
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlaceSurveyModal;
