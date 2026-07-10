import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { LocationIcon, ChatIcon, CheckCircleIcon } from '@icons/index';
import { surveysService } from '@lib/supabase';
import { useAuth } from '@presentation/context';
import { Button } from '@presentation/components/ui/button';
import { ErrorFeedback } from '@presentation/components/ui/error-feedback';
import { useWizardState } from '@presentation/hooks/form/useWizardState';
import { SURVEY_STEPS, SURVEY_STEP_ORDER } from '@constants/steps';
import { ERROR_MESSAGES, createError } from '@errors/index';
import toast from 'react-hot-toast';

interface PlaceSurveyModalProps {
  open: boolean;
  onClose: () => void;
  placeId: string;
  placeName: string;
}

interface SurveyState {
  isNearby: boolean | null;
  rating: number;
  hoverRating: number;
  wouldRecommend: boolean | null;
  comment: string;
  error: string | null;
}

const INITIAL_STATE: SurveyState = {
  isNearby: null,
  rating: 0,
  hoverRating: 0,
  wouldRecommend: null,
  comment: '',
  error: null,
};

const STEP_CONFIG = {
  [SURVEY_STEPS.ENTER]: { icon: LocationIcon, title: '', subtitle: '' },
  [SURVEY_STEPS.RATE]: { icon: Star, title: '¿Qué te pareció?', subtitle: 'Tu opinión ayuda a otros usuarios' },
  [SURVEY_STEPS.RECOMMEND]: { icon: ThumbsUp, title: '¿Lo recomendarías?', subtitle: 'Tu recomendación ayuda a la comunidad' },
  [SURVEY_STEPS.COMMENT]: { icon: ChatIcon, title: 'Algo más que agregar?', subtitle: 'Cuéntanos tu experiencia (opcional)' },
};

const PlaceSurveyModal: React.FC<PlaceSurveyModalProps> = ({ open, onClose, placeId, placeName }) => {
  const { user } = useAuth();
  const wizard = useWizardState({ steps: SURVEY_STEP_ORDER, initialStep: SURVEY_STEPS.ENTER });
  const [survey, setSurvey] = useState<SurveyState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);

  const updateSurvey = (partial: Partial<SurveyState>) => setSurvey(prev => ({ ...prev, ...partial }));

  const handleSubmit = async () => {
    if (!user) {
      updateSurvey({ error: ERROR_MESSAGES.AUTH.SESSION_EXPIRED });
      return;
    }
    setSubmitting(true);
    updateSurvey({ error: null });
    try {
      await surveysService.submitSurvey({
        userId: user.id,
        placeId,
        isNearby: survey.isNearby === true,
        rating: survey.rating > 0 ? survey.rating : undefined,
        wouldRecommend: survey.wouldRecommend === true ? true : undefined,
        comment: survey.comment.trim() || undefined,
      });
      wizard.goToStep(SURVEY_STEPS.DONE);
    } catch {
      updateSurvey({ error: ERROR_MESSAGES.REVIEW.SUBMIT_FAILED });
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setSurvey(INITIAL_STATE);
    wizard.goToStep(SURVEY_STEPS.ENTER);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-stone-100"
            role="dialog"
            aria-modal="true"
            aria-label="Encuesta del lugar"
          >
            {wizard.currentStep !== SURVEY_STEPS.DONE && (
              <nav className="flex gap-1.5 mb-5 justify-center" aria-label="Progreso de la encuesta">
                {SURVEY_STEP_ORDER.map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      SURVEY_STEP_ORDER.indexOf(s) <= SURVEY_STEP_ORDER.indexOf(wizard.currentStep)
                        ? 'w-6 bg-amber-500' : 'w-1.5 bg-stone-200'
                    }`}
                    role="progressbar"
                    aria-valuenow={SURVEY_STEP_ORDER.indexOf(wizard.currentStep) + 1}
                    aria-valuemin={1}
                    aria-valuemax={SURVEY_STEP_ORDER.length}
                  />
                ))}
              </nav>
            )}

            <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors" aria-label="Cerrar">
              <X className="w-4 h-4 text-stone-500" />
            </button>

            {survey.error && (
              <ErrorFeedback error={createError('SURVEY_ERROR', survey.error)} onDismiss={() => updateSurvey({ error: null })} />
            )}

            {wizard.currentStep === SURVEY_STEPS.ENTER && (
              <article className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <LocationIcon size={32} className="text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-1">{placeName}</h3>
                <p className="text-sm text-stone-500 mb-6">¿Estuviste en este lugar?</p>
                <div className="flex gap-3">
                  <Button onClick={() => { updateSurvey({ isNearby: true }); wizard.goNext(); }} size="lg" fullWidth>
                    Sí, entré
                  </Button>
                  <Button onClick={() => { updateSurvey({ isNearby: false }); wizard.goNext(); }} variant="secondary" size="lg" fullWidth>
                    No, solo pasé
                  </Button>
                </div>
              </article>
            )}

            {wizard.currentStep === SURVEY_STEPS.RATE && (
              <article className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-1">{STEP_CONFIG[SURVEY_STEPS.RATE].title}</h3>
                <p className="text-sm text-stone-500 mb-5">{STEP_CONFIG[SURVEY_STEPS.RATE].subtitle}</p>
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => { updateSurvey({ rating: s }); wizard.goNext(); }}
                      onMouseEnter={() => updateSurvey({ hoverRating: s })}
                      onMouseLeave={() => updateSurvey({ hoverRating: 0 })}
                      className="transition-all hover:scale-110 active:scale-95" aria-label={`Calificar ${s} estrellas`}>
                      <Star className={`w-10 h-10 ${
                        s <= (survey.hoverRating || survey.rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                      }`} />
                    </button>
                  ))}
                </div>
                <button onClick={() => wizard.goNext()} className="text-xs text-stone-400 hover:text-stone-600 underline transition-colors">
                  Saltar
                </button>
              </article>
            )}

            {wizard.currentStep === SURVEY_STEPS.RECOMMEND && (
              <article className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-1">{STEP_CONFIG[SURVEY_STEPS.RECOMMEND].title}</h3>
                <p className="text-sm text-stone-500 mb-6">{STEP_CONFIG[SURVEY_STEPS.RECOMMEND].subtitle}</p>
                <div className="flex gap-3">
                  <Button onClick={() => { updateSurvey({ wouldRecommend: true }); wizard.goNext(); }} size="lg" fullWidth className="!bg-emerald-500 hover:!bg-emerald-600">
                    <ThumbsUp className="w-4 h-4" /> Sí
                  </Button>
                  <Button onClick={() => { updateSurvey({ wouldRecommend: false }); wizard.goNext(); }} variant="secondary" size="lg" fullWidth>
                    <ThumbsDown className="w-4 h-4" /> No
                  </Button>
                </div>
              </article>
            )}

            {wizard.currentStep === SURVEY_STEPS.COMMENT && (
              <article className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <ChatIcon size={32} className="text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-1">{STEP_CONFIG[SURVEY_STEPS.COMMENT].title}</h3>
                <p className="text-sm text-stone-500 mb-5">{STEP_CONFIG[SURVEY_STEPS.COMMENT].subtitle}</p>
                <textarea value={survey.comment} onChange={(e) => updateSurvey({ comment: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-200 rounded-2xl text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none"
                  rows={3} placeholder="Ej. La atención fue excelente..." />
                <footer className="flex gap-3 mt-4">
                  <Button onClick={handleSubmit} disabled={submitting} loading={submitting} size="lg" fullWidth>
                    {submitting ? null : <Send className="w-4 h-4" />}
                    {submitting ? 'Enviando...' : 'Enviar'}
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting} variant="secondary" size="lg">
                    Saltar
                  </Button>
                </footer>
              </article>
            )}

            {wizard.currentStep === SURVEY_STEPS.DONE && (
              <article className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-1">¡Gracias por tu opinión!</h3>
                <p className="text-sm text-stone-500 mb-6">Tu feedback ayuda a mejorar la comunidad</p>
                <Button onClick={handleClose} size="lg" fullWidth>
                  Cerrar
                </Button>
              </article>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlaceSurveyModal;
