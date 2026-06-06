import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { MarketSurvey, SurveyQuestion } from '@domain/entities';
import { useAuth } from '@presentation/context';
import { SurveyWelcomeCard, SurveyInfoCard, SurveyQuestionCard, SurveyDoneCard } from './SurveySteps';

interface SurveyCardProps {
  survey: MarketSurvey;
  onClose: () => void;
  onResponded: () => void;
}

const SurveyCard: React.FC<SurveyCardProps> = ({ survey, onClose, onResponded }) => {
  const { user } = useAuth();
  const validQuestions = useMemo(() => survey.questions?.filter(q => q.question?.trim() && q.options?.length >= 2) || [], [survey.questions]);
  const totalCards = 2 + validQuestions.length;
  const [currentQ, setCurrentQ] = useState<'welcome' | 'info' | number>('welcome');
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string }[]>([]);

  const goTo = useCallback((s: 'welcome' | 'info' | number) => setCurrentQ(s), []);

  const handleAnswer = async (question: SurveyQuestion, answer: string) => {
    const { marketSurveysService } = await import('@lib/supabase');
    if (!user) return;
    const newAnswers = [...answers, { questionId: question.id || question.question, answer }];
    setAnswers(newAnswers);

    const qIdx = validQuestions.indexOf(question);
    if (qIdx < validQuestions.length - 1) {
      setCurrentQ(qIdx + 1);
      return;
    }

    setLoading(true);
    try {
      await marketSurveysService.respond(survey.id, user.id, newAnswers);
      onResponded();
      setCurrentQ('done');
    } catch { /* already responded */ }
    setLoading(false);
  };

  const progressIdx = currentQ === 'welcome' ? 0 : currentQ === 'info' ? 1 : (currentQ as number) + 2;

  return (
    <div className="relative">
      <button onClick={onClose}
        className="absolute -top-2 -right-2 z-20 w-7 h-7 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-50 shadow-sm transition-colors">
        <X className="w-3.5 h-3.5 text-stone-500" />
      </button>

      {currentQ !== 'done' && totalCards > 2 && (
        <div className="absolute inset-x-0 top-0 flex items-center justify-center gap-1.5 z-10 mb-2">
          {Array.from({ length: totalCards - (currentQ === 'welcome' ? 1 : 0) }).map((_, i) => (
            <div key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === (currentQ === 'welcome' ? 0 : progressIdx - 1) ? 'w-6 bg-purple-500' : 'w-1.5 bg-stone-200'
              }`}
            />
          ))}
        </div>
      )}

      <div className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-sm border border-stone-100 -translate-y-1 scale-[0.97] z-0" />
      <div className="absolute inset-0 rounded-2xl bg-white/80 backdrop-blur-sm border border-stone-100 -translate-y-0.5 scale-[0.985] z-[1]" />

      <div className="relative h-72 sm:h-80 z-2">
        <AnimatePresence mode="wait">
          {currentQ === 'welcome' && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }} className="h-full">
              <SurveyWelcomeCard survey={survey} onStart={() => goTo('info')} />
            </motion.div>
          )}
          {currentQ === 'info' && (
            <motion.div key="info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }} className="h-full">
              <SurveyInfoCard survey={survey} onBack={() => goTo('welcome')} onNext={() => goTo(0)} />
            </motion.div>
          )}
          {typeof currentQ === 'number' && currentQ < validQuestions.length && (
            <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }} className="h-full">
              <SurveyQuestionCard
                label={`Encuesta ${currentQ + 1}/${validQuestions.length}`}
                question={validQuestions[currentQ].question}
                options={validQuestions[currentQ].options}
                onAnswer={(answer: string) => handleAnswer(validQuestions[currentQ], answer)}
                onBack={currentQ > 0 ? () => goTo(currentQ - 1) : undefined}
                loading={loading}
                isLast={currentQ === validQuestions.length - 1}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {currentQ === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="h-full">
              <SurveyDoneCard onClose={onClose} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SurveyCard;