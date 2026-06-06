export interface SurveyFormData {
  title: string;
  description: string;
  about: string;
  problemSolved: string;
}

export interface CreateSurveyModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const INITIAL_FORM: SurveyFormData = {
  title: '',
  description: '',
  about: '',
  problemSolved: '',
};

export const MAX_QUESTIONS = 5;
export const MIN_QUESTIONS = 1;
export const MAX_OPTIONS = 4;
export const MIN_OPTIONS = 2;
