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
        step === 0 ? 'invisible' : 'text-stone-600 hover:bg-stone-100'
      }`}
    >
      Anterior
    </button>
    {showNext && (
      <button
        type="button" onClick={onNext}
        className="px-6 py-2.5 bg-primary-500 text-white rounded-xl font-medium text-sm hover:bg-primary-600 transition-all"
      >
        Siguiente
      </button>
    )}
  </div>
);

export default NavigationButtons;
