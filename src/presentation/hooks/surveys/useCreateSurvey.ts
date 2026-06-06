import { useState } from 'react';
import toast from 'react-hot-toast';
import { marketSurveysService } from '@lib/supabase';
import { sendSurveyPushNotification } from '@lib/supabase/services/push/sendPush';
import { useAuth, usePlaces } from '@presentation/context';
import type { SurveyQuestion } from '@domain/entities';
import type { SurveyFormData } from '@presentation/components/features/surveys/CreateSurveyModal.types';
import {
  INITIAL_FORM,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  MAX_OPTIONS,
  MIN_OPTIONS,
} from '@presentation/components/features/surveys/CreateSurveyModal.types';

function createEmptyQuestion(): SurveyQuestion {
  return { id: crypto.randomUUID(), question: '', options: ['', ''] };
}

export function useCreateSurvey(onCreated: () => void, onClose: () => void) {
  const { user } = useAuth();
  const { categories } = usePlaces();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<SurveyFormData>(INITIAL_FORM);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([createEmptyQuestion()]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  const setFormField = (field: keyof SurveyFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    if (questions.length >= MAX_QUESTIONS) {
      toast.error(`Máximo ${MAX_QUESTIONS} preguntas`);
      return;
    }
    setQuestions(prev => [...prev, createEmptyQuestion()]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= MIN_QUESTIONS) {
      toast.error(`Debe haber al menos ${MIN_QUESTIONS} pregunta`);
      return;
    }
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, value: string) => {
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, question: value } : q)));
  };

  const addOption = (qId: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== qId) return q;
        if (q.options.length >= MAX_OPTIONS) {
          toast.error(`Máximo ${MAX_OPTIONS} opciones`);
          return q;
        }
        return { ...q, options: [...q.options, ''] };
      }),
    );
  };

  const updateOption = (qId: string, oIdx: number, value: string) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== qId) return q;
        const options = [...q.options];
        options[oIdx] = value;
        return { ...q, options };
      }),
    );
  };

  const removeOption = (qId: string, oIdx: number) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id !== qId) return q;
        if (q.options.length <= MIN_OPTIONS) {
          toast.error(`Mínimo ${MIN_OPTIONS} opciones`);
          return q;
        }
        return { ...q, options: q.options.filter((_, i) => i !== oIdx) };
      }),
    );
  };

  const toggleCategory = (catId: string) => {
    setSelectedCats(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (selectedCats.length === 0) {
      toast.error('Selecciona al menos una categoría objetivo');
      return;
    }
    if (!form.title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }
    const validQuestions = questions.filter(
      q => q.question.trim() && q.options.every(o => o.trim()),
    );
    if (validQuestions.length === 0) {
      toast.error('Agrega al menos una pregunta con opciones');
      return;
    }
    setLoading(true);
    try {
      const survey = await marketSurveysService.create(
        {
          ...form,
          questions: validQuestions.map(q => ({
            question: q.question,
            options: q.options,
          })),
          categoryIds: selectedCats,
        },
        user.id,
      );
      try {
        await marketSurveysService.notifyUsers(survey.id, selectedCats, form.title);
      } catch (notifErr) {
        console.error('Error notifying users:', notifErr);
      }
      try {
        await sendSurveyPushNotification(survey.id, form.title);
      } catch (pushErr) {
        console.error('Error sending push:', pushErr);
      }
      toast.success('Encuesta creada exitosamente');
      onCreated();
      onClose();
    } catch {
      toast.error('Error al crear encuesta');
    } finally {
      setLoading(false);
    }
  };

  const validQuestionsCount = questions.filter(
    q => q.question.trim() && q.options.every(o => o.trim()),
  ).length;
  const totalCards = 2 + validQuestionsCount;

  return {
    user,
    categories,
    loading,
    form,
    questions,
    selectedCats,
    totalCards,
    setFormField,
    addQuestion,
    removeQuestion,
    updateQuestion,
    addOption,
    updateOption,
    removeOption,
    toggleCategory,
    handleSubmit,
  };
}
