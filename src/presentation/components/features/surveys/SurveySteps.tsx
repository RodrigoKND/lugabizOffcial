import { Loader2, CheckCircle2, ArrowRight, ChevronLeft, Star } from 'lucide-react';
import { MarketSurvey } from '@domain/entities';

interface WelcomeProps {
  survey: MarketSurvey;
  onStart: () => void;
}

export const SurveyWelcomeCard: React.FC<WelcomeProps> = ({ survey, onStart }) => (
  <article className="h-full bg-white rounded-2xl border border-purple-100 overflow-hidden flex flex-col shadow-sm">
    <div className="relative h-24 shrink-0 bg-linear-to-r from-purple-600 to-purple-800 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      <div className="absolute inset-0 bg-linear-to-t from-purple-900/40 to-transparent" />
    </div>
    <div className="flex-1 p-4 flex flex-col justify-between">
      <div>
        <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5">
          Investigación de Mercado
        </span>
        <h3 className="text-stone-900 font-bold text-sm leading-tight mb-1">{survey.title}</h3>
        <p className="text-stone-500 text-xs leading-tight line-clamp-2">
          {survey.description || 'Comparte tu opinión en unas preguntas rápidas'}
        </p>
      </div>
      <button onClick={onStart}
        className="w-full py-2.5 bg-purple-500 text-white text-xs font-semibold rounded-xl hover:bg-purple-600 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 mt-3">
        Empezar encuesta <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  </article>
);

interface InfoProps {
  survey: MarketSurvey;
  onBack: () => void;
  onNext: () => void;
}

export const SurveyInfoCard: React.FC<InfoProps> = ({ survey, onBack, onNext }) => (
  <article className="h-full bg-white rounded-2xl border border-amber-100 overflow-hidden flex flex-col shadow-sm">
    <div className="p-4 flex flex-col flex-1">
      <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 self-start">
        Sobre el Producto
      </span>
      <section className="flex-1 overflow-y-auto space-y-2.5 scrollbar-hide" aria-label="Información del producto">
        {survey.about && (
          <div>
            <h4 className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">¿De qué se trata?</h4>
            <p className="text-xs text-stone-700 mt-0.5 leading-relaxed">{survey.about}</p>
          </div>
        )}
        {survey.problemSolved && (
          <div>
            <h4 className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Problema que resuelve</h4>
            <p className="text-xs text-stone-700 mt-0.5 leading-relaxed">{survey.problemSolved}</p>
          </div>
        )}
      </section>
      <nav aria-label="Navegación de encuesta" className="flex gap-2 mt-3">
        <button onClick={onBack}
          className="flex-1 py-2.5 bg-stone-100 text-stone-600 text-xs font-semibold rounded-xl hover:bg-stone-200 transition-all flex items-center justify-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" /> Atrás
        </button>
        <button onClick={onNext}
          className="flex-1 py-2.5 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 active:scale-[0.98] transition-all flex items-center justify-center gap-1">
          Ver preguntas <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </nav>
    </div>
  </article>
);

interface QuestionProps {
  label: string;
  question: string;
  options: string[];
  onAnswer: (answer: string) => void;
  onBack?: () => void;
  loading?: boolean;
  isLast?: boolean;
}

export const SurveyQuestionCard: React.FC<QuestionProps> = ({ label, question, options, onAnswer, onBack, loading, isLast }) => (
  <article className="h-full bg-white rounded-2xl border border-purple-100 flex flex-col shadow-sm">
    <div className="p-4 flex flex-col flex-1">
      <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 self-start">{label}</span>
      <h3 className="text-stone-900 font-bold text-sm leading-snug mb-3">{question}</h3>
      <section className="flex-1 space-y-2" aria-label="Opciones de respuesta">
        {options.map((opt) => (
          <button key={opt} onClick={() => onAnswer(opt)} disabled={loading}
            className="w-full text-left bg-stone-50 hover:bg-purple-50 text-stone-700 text-xs py-2 px-3 rounded-xl border border-stone-100 hover:border-purple-200 transition-all disabled:opacity-50">
            {opt}
          </button>
        ))}
      </section>
      <nav aria-label="Navegación de preguntas" className="flex gap-2 mt-3">
        {onBack && (
          <button onClick={onBack} className="flex-1 py-2.5 bg-stone-100 text-stone-600 text-xs font-semibold rounded-xl hover:bg-stone-200 transition-all flex items-center justify-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" /> Atrás
          </button>
        )}
        {isLast && (
          <button onClick={() => onAnswer('')} disabled={loading}
            className="flex-1 py-2.5 bg-linear-to-r from-purple-500 to-purple-600 text-white text-xs font-semibold rounded-xl hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : <Star className="w-3.5 h-3.5" aria-hidden="true" />}
            {loading ? 'Enviando...' : 'Enviar opinión'}
          </button>
        )}
      </nav>
    </div>
  </article>
);

interface DoneProps {
  onClose: () => void;
}

export const SurveyDoneCard: React.FC<DoneProps> = ({ onClose }) => (
  <article className="h-full bg-white rounded-2xl border border-green-100 flex flex-col items-center justify-center p-6 shadow-sm">
    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4" aria-hidden="true">
      <CheckCircle2 className="w-7 h-7 text-green-500" />
    </div>
    <h3 className="text-stone-900 font-bold text-sm mb-1">¡Gracias por tu opinión!</h3>
    <p className="text-stone-500 text-xs text-center mb-5">Tu feedback ayuda a mejorar el producto</p>
    <button onClick={onClose}
      className="px-6 py-2.5 bg-green-500 text-white text-xs font-semibold rounded-xl hover:bg-green-600 transition-all">
      Cerrar
    </button>
  </article>
);