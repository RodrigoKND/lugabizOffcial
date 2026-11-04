import { ChevronLeft, ArrowRight } from 'lucide-react';
import { MarketSurvey } from '@domain/entities';

interface InfoStepProps {
  survey: MarketSurvey;
  onBack: () => void;
  onNext: () => void;
}

export default function InfoStep({ survey, onBack, onNext }: InfoStepProps) {
  return (
    <div className="flex flex-col h-full p-4">
      <span className="inline-block bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full mb-3 self-start border border-amber-100">
        Sobre el Producto
      </span>
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
        {survey.about && (
          <div className="bg-lg-surface-2 rounded-xl p-3 border border-lg-surface-2">
            <p className="text-[10px] font-bold text-lg-dim uppercase tracking-widest mb-1">¿De qué se trata?</p>
            <p className="text-xs text-lg-text leading-relaxed">{survey.about}</p>
          </div>
        )}
        {survey.problemSolved && (
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100/60">
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Problema que resuelve</p>
            <p className="text-xs text-lg-text leading-relaxed">{survey.problemSolved}</p>
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={onBack}
          className="flex-1 py-2.5 bg-lg-surface-2 text-lg-dim text-xs font-semibold rounded-xl hover:bg-lg-surface-2 transition-all flex items-center justify-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Atrás
        </button>
        <button onClick={onNext}
          className="flex-1 py-2.5 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 active:scale-[0.98] transition-all flex items-center justify-center gap-1">
          Ver preguntas <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
