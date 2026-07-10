import { ChevronLeft, Star, Loader2 } from 'lucide-react';
import ProgressDots from './ProgressDots';

interface QuestionStepProps {
  question: string;
  options: string[];
  index: number;
  total: number;
  loading: boolean;
  onAnswer: (a: string) => void;
  onBack: () => void;
}

export default function QuestionStep({
  question, options, index, total, loading, onAnswer, onBack,
}: QuestionStepProps) {
  return (
    <div className="flex flex-col h-full">
      <ProgressDots total={total} current={index} />
      <div className="px-4 pb-1">
        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
          Pregunta {index + 1} / {total}
        </span>
        <h3 className="text-stone-900 font-bold text-sm leading-snug mt-1">{question}</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 scrollbar-hide">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onAnswer(opt)}
            disabled={loading}
            className="w-full text-left bg-stone-50 hover:bg-purple-50 active:bg-purple-100 text-stone-700 text-xs py-2.5 px-3.5 rounded-xl border border-stone-100 hover:border-purple-200 hover:text-purple-800 transition-all disabled:opacity-50 font-medium"
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="px-4 pb-4 pt-2 flex gap-2">
        <button onClick={onBack}
          className="flex-1 py-2.5 bg-stone-100 text-stone-600 text-xs font-semibold rounded-xl hover:bg-stone-200 transition-all flex items-center justify-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Atrás
        </button>
        {index === total - 1 && (
          <button onClick={() => onAnswer('')} disabled={loading}
            className="flex-1 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-purple-200 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-60">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
            {loading ? 'Enviando...' : 'Enviar opinión'}
          </button>
        )}
      </div>
    </div>
  );
}
