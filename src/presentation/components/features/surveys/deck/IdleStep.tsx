import { Sparkles, ArrowRight, ClipboardList } from 'lucide-react';
import { MarketSurvey } from '@domain/entities';

interface IdleStepProps {
  survey: MarketSurvey;
  onStart: () => void;
}

export default function IdleStep({ survey, onStart }: IdleStepProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="relative h-[4.5rem] shrink-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)' }} />
        <Sparkles className="absolute bottom-2 right-3 w-5 h-5 text-white/30" />
      </div>
      <div className="flex-1 p-4 flex flex-col">
        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 self-start border border-purple-100">
          <ClipboardList className="w-3 h-3" /> Investigación de Mercado
        </span>
        <h3 className="text-stone-900 font-bold text-sm leading-snug mb-1.5">{survey.title}</h3>
        <p className="text-stone-400 text-xs leading-relaxed line-clamp-2 flex-1">
          {survey.description || 'Comparte tu opinión en unas preguntas rápidas'}
        </p>
        <button
          onClick={onStart}
          className="mt-3 w-full py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold rounded-xl hover:shadow-lg hover:shadow-purple-200 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
        >
          Comenzar <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
