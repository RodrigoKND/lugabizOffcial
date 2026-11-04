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
  <div className="flex items-center justify-between pt-5 border-t border-lg-surface-2">
    <button type="button" onClick={onBack}
      className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
        step === 0 ? 'invisible' : 'text-lg-dim hover:text-lg-text hover:bg-lg-surface-2'
      }`}>
      <ArrowLeft className="w-3.5 h-3.5" /> Anterior
    </button>

    {step < TOTAL_STEPS - 1 ? (
      <button type="button" onClick={onNext}
        className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-lg-accent text-lg-ink rounded-xl font-semibold text-sm hover:bg-lg-accent active:scale-[0.98] transition-all shadow-sm hover:shadow-md">
        Siguiente <ArrowRight className="w-3.5 h-3.5" />
      </button>
    ) : (
      <button type="submit" disabled={isSubmitting}
        className="inline-flex items-center gap-2 px-7 py-2.5 bg-lg-accent text-lg-ink rounded-xl font-semibold text-sm hover:shadow-lg hover: hover: active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm">
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
