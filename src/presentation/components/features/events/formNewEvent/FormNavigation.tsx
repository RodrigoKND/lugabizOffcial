import React from 'react';
import { Send, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { TOTAL_STEPS } from './EventFormTypes';

interface Props {
  step: number;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
}

const FormNavigation: React.FC<Props> = ({ step, isSubmitting, onBack, onNext }) => (
  <div className="flex items-center justify-between pt-5 border-t border-stone-100">
    <button type="button" onClick={onBack}
      className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
        step === 0 ? 'invisible' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
      }`}>
      <ArrowLeft className="w-3.5 h-3.5" /> Anterior
    </button>

    {step < TOTAL_STEPS - 1 ? (
      <button type="button" onClick={onNext}
        className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-amber-500 text-white rounded-xl font-semibold text-sm hover:bg-amber-600 active:scale-[0.98] transition-all shadow-sm hover:shadow-md">
        Siguiente <ArrowRight className="w-3.5 h-3.5" />
      </button>
    ) : (
      <button type="submit" disabled={isSubmitting}
        className="inline-flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm">
        {isSubmitting ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</>
        ) : (
          <><Send className="w-4 h-4" /> Publicar Evento</>
        )}
      </button>
    )}
  </div>
);

export default FormNavigation;
