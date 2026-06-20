import React from 'react';

interface StepIndicatorProps {
  step: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ step, totalSteps }) => (
  <div className="flex gap-2 mt-4">
    {Array.from({ length: totalSteps }).map((_, i) => (
      <div
        key={i}
        className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-primary-500' : 'bg-stone-200'}`}
      />
    ))}
  </div>
);

export default StepIndicator;
