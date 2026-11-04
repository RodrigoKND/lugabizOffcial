import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { TOTAL_STEPS } from './EventFormTypes';

interface Props {
  step: number;
  onClose: () => void;
}

const FormHeader: React.FC<Props> = ({ step, onClose }) => (
  <div className="sticky top-0 bg-lg-surface border-b border-lg-surface-2 px-5 py-3.5 flex items-center justify-between z-10">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-lg-surface-2 rounded-lg flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-lg-accent" />
      </div>
      <h2 className="text-base font-bold text-lg-text">Crear Evento</h2>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i <= step ? 'bg-lg-accent' : 'bg-lg-surface-2'}`} />
        ))}
      </div>
      <button onClick={onClose} className="p-1.5 hover:bg-lg-surface-2 rounded-lg transition-colors">
        <X className="w-4 h-4 text-lg-dim" />
      </button>
    </div>
  </div>
);

export default FormHeader;
