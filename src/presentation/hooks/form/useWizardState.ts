import { useState, useCallback } from 'react';

interface WizardState {
  currentStep: string;
  stepIndex: number;
  totalSteps: number;
  direction: 'forward' | 'backward';
}

interface UseWizardOptions {
  steps: readonly string[];
  initialStep?: string;
}

export function useWizardState({ steps, initialStep }: UseWizardOptions) {
  const initialIndex = initialStep ? steps.indexOf(initialStep) : 0;

  const [wizard, setWizard] = useState<WizardState>({
    currentStep: steps[initialIndex] || steps[0],
    stepIndex: initialIndex,
    totalSteps: steps.length,
    direction: 'forward',
  });

  const goToStep = useCallback((step: string) => {
    const index = steps.indexOf(step);
    if (index === -1) return;
    setWizard(prev => ({
      currentStep: step,
      stepIndex: index,
      totalSteps: steps.length,
      direction: index > prev.stepIndex ? 'forward' : 'backward',
    }));
  }, [steps]);

  const goNext = useCallback(() => {
    setWizard(prev => {
      const nextIndex = Math.min(prev.stepIndex + 1, prev.totalSteps - 1);
      return {
        ...prev,
        currentStep: steps[nextIndex],
        stepIndex: nextIndex,
        direction: 'forward',
      };
    });
  }, [steps]);

  const goPrev = useCallback(() => {
    setWizard(prev => {
      const prevIndex = Math.max(prev.stepIndex - 1, 0);
      return {
        ...prev,
        currentStep: steps[prevIndex],
        stepIndex: prevIndex,
        direction: 'backward',
      };
    });
  }, [steps]);

  const isFirstStep = wizard.stepIndex === 0;
  const isLastStep = wizard.stepIndex === wizard.totalSteps - 1;

  return {
    ...wizard,
    goToStep,
    goNext,
    goPrev,
    isFirstStep,
    isLastStep,
  };
}
