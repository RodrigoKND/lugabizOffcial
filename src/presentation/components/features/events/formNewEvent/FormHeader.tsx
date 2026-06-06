import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { TOTAL_STEPS } from './EventFormTypes';

interface Props {
  step: number;
  onClose: () => void;
}

const FormHeader: React.FC<Props> = ({ step, onClose }) => (
  <div className="sticky top-0 bg-white border-b border-stone-100 px-5 py-3.5 flex items-center justify-between z-10">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-amber-600" />
      </div>
      <h2 className="text-base font-bold text-stone-800">Crear Evento</h2>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i <= step ? 'bg-amber-500' : 'bg-stone-200'}`} />
        ))}
      </div>
      <button onClick={onClose} className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
        <X className="w-4 h-4 text-stone-400" />
      </button>
    </div>
  </div>
);

export default FormHeader;
