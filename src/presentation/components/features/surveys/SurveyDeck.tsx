import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, CheckCircle2, X, ChevronDown,
} from 'lucide-react';
import { MarketSurvey, SurveyNotification } from '@domain/entities';
import { useAuth } from '@presentation/context';
import { marketSurveysService } from '@lib/supabase';
import { IdleStep, InfoStep, QuestionStep } from './deck';

interface SurveyDeckProps {
  surveys: MarketSurvey[];
  onRefresh: () => void;
}

type StepType = 'idle' | 'info' | 'question' | 'thankyou';

// ── Main deck ─────────────────────────────────────────────────────────────────
const SurveyDeck: React.FC<SurveyDeckProps> = ({ surveys, onRefresh }) => {
  const { user } = useAuth();
  const [minimized, setMinimized] = useState(false);
  const [surveyIdx, setSurveyIdx] = useState(0);
  const [stepType, setStepType] = useState<StepType>('idle');
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const survey = surveys[surveyIdx];
  const questions = useMemo(
    () => survey?.questions?.filter(q => q.question?.trim() && q.options?.length >= 2) ?? [],
    [survey],
  );
  const backCards = surveys.slice(surveyIdx + 1, surveyIdx + 3);
  const remaining = surveys.length - surveyIdx;

  const advanceSurvey = useCallback(() => {
    if (surveyIdx < surveys.length - 1) {
      setSurveyIdx(i => i + 1);
      setStepType('idle');
      setQuestionIdx(0);
      setAnswers([]);
    } else {
      setStepType('thankyou');
    }
  }, [surveyIdx, surveys.length]);

  const handleAnswer = async (answer: string) => {
    if (!user || !survey) return;
    const q = questions[questionIdx];
    if (!q) return;
    const newAnswers = [...answers, { questionId: q.id || q.question, answer }];
    setAnswers(newAnswers);

    if (questionIdx < questions.length - 1) {
      setQuestionIdx(i => i + 1);
      return;
    }

    setLoading(true);
    try {
      await marketSurveysService.respond(survey.id, user.id, newAnswers);
      onRefresh();
    } catch (err) { console.error('[SurveyDeck:respond]', err); }
    setLoading(false);
    advanceSurvey();
  };

  const dismissAll = async () => {
    if (!user) return;
    for (const s of surveys) {
      try {
        const notifs = await marketSurveysService.getNotificationsForUser(user.id);
        const m = notifs.find((n: SurveyNotification) => n.surveyId === s.id);
        if (m) await marketSurveysService.markAsRead(m.id);
      } catch (err) { console.error('[SurveyDeck:dismissAll]', err); }
    }
    onRefresh();
  };

  if (!survey || surveys.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-40 w-72 sm:w-80 select-none">
      <AnimatePresence mode="wait">
        {minimized ? (
          <motion.button
            key="tab"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMinimized(false)}
            className="w-full bg-white/95 backdrop-blur-sm rounded-2xl border border-purple-100 shadow-[0_8px_32px_-4px_rgba(109,40,217,0.18)] px-4 py-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm shrink-0">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-stone-800 truncate">{survey.title}</p>
              <p className="text-[10px] text-purple-500 font-medium">
                {remaining} encuesta{remaining > 1 ? 's' : ''} pendiente{remaining > 1 ? 's' : ''}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-stone-400 -rotate-180 shrink-0" />
          </motion.button>
        ) : (
          <motion.div
            key="deck"
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Controls */}
            <div className="flex items-center justify-between mb-2.5 px-1">
              <div className="flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-[11px] font-black text-stone-500 uppercase tracking-widest">Encuestas</span>
                {remaining > 1 && (
                  <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-bold leading-none">
                    {remaining}
                  </span>
                )}
              </div>
              <div className="flex gap-0.5">
                <button
                  onClick={() => setMinimized(true)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100/80 transition-all"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={dismissAll}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card stack */}
            <div className="relative h-[19rem]">
              {/* Back cards — baraja effect: offset to the right */}
              {backCards.map((s, i) => (
                <div
                  key={s.id}
                  className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
                  style={{
                    zIndex: i + 1,
                    background: i === 0 ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.65)',
                    border: `1px solid rgba(139,92,246,${i === 0 ? 0.18 : 0.1})`,
                    boxShadow: '0 4px 24px -4px rgba(109,40,217,0.1)',
                    transform: `translateX(${-(i + 1) * 8}px) translateY(${(i + 1) * 4}px) rotate(${-(i + 1) * 2}deg) scale(${1 - (i + 1) * 0.025})`,
                  }}
                >
                  <div className="h-1.5 bg-gradient-to-r from-violet-400/50 to-purple-500/50" />
                  <div className="px-4 pt-2.5">
                    <p className="text-[10px] font-semibold text-purple-400/80 truncate">{s.title}</p>
                  </div>
                </div>
              ))}

              {/* Active card */}
              <AnimatePresence mode="wait">
                {stepType !== 'thankyou' && (
                  <motion.div
                    key={`card-${surveyIdx}`}
                    initial={{ x: -20, opacity: 0, scale: 0.95 }}
                    animate={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ x: 160, opacity: 0, rotate: 14, scale: 0.86 }}
                    transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
                    className="absolute inset-0 z-10"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <div className="h-full bg-white rounded-2xl border border-purple-100/80 shadow-[0_8px_32px_-4px_rgba(109,40,217,0.18)] overflow-hidden flex flex-col">
                      <AnimatePresence mode="wait">
                        {stepType === 'idle' && (
                          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="h-full">
                            <IdleStep survey={survey} onStart={() => setStepType('info')} />
                          </motion.div>
                        )}
                        {stepType === 'info' && (
                          <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="h-full">
                            <InfoStep
                              survey={survey}
                              onBack={() => setStepType('idle')}
                              onNext={() => { setQuestionIdx(0); setStepType('question'); }}
                            />
                          </motion.div>
                        )}
                        {stepType === 'question' && questions[questionIdx] && (
                          <motion.div key={`q-${questionIdx}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="h-full">
                            <QuestionStep
                              question={questions[questionIdx].question}
                              options={questions[questionIdx].options}
                              index={questionIdx}
                              total={questions.length}
                              loading={loading}
                              onAnswer={handleAnswer}
                              onBack={questionIdx > 0
                                ? () => setQuestionIdx(i => i - 1)
                                : () => setStepType('info')}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Thank you */}
              <AnimatePresence>
                {stepType === 'thankyou' && (
                  <motion.div
                    key="thankyou"
                    initial={{ scale: 0.88, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.88, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    className="absolute inset-0 z-20 bg-white rounded-2xl border border-green-100 shadow-[0_8px_32px_-4px_rgba(34,197,94,0.2)] flex flex-col items-center justify-center p-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-green-200">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-stone-900 font-bold text-base mb-1.5">¡Todas completadas!</h3>
                    <p className="text-stone-400 text-xs text-center mb-5 leading-relaxed">
                      Gracias por tomarte el tiempo de responder. Tu opinión es muy valiosa.
                    </p>
                    <button
                      onClick={dismissAll}
                      className="px-8 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-green-200 active:scale-[0.98] transition-all"
                    >
                      Finalizar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SurveyDeck;
