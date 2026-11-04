import React from 'react';
import { ArrowRight } from 'lucide-react';

interface NavigationButtonsProps {
  step: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  showNext: boolean;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ step, totalSteps, onPrev, onNext, showNext }) => (
  <div className="flex items-center justify-between">
    <button
      type="button" onClick={onPrev}
      className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
        step === 0 ? 'invisible' : 'text-lg-dim hover:bg-lg-surface-2'
      }`}
    >
      Anterior
    </button>
    {showNext && (
      <button
        type="button" onClick={onNext}
        className="px-6 py-2.5 bg-lg-accent text-lg-ink rounded-xl font-medium text-sm hover:bg-lg-accent transition-all"
      >
        Siguiente
      </button>
    )}
  </div>
);

export default NavigationButtons;
