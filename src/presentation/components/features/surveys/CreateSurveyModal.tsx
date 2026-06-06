import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, BarChart3, Sparkles } from 'lucide-react';
import { useCreateSurvey } from '@presentation/hooks/surveys/useCreateSurvey';
import SurveyFormFields from './SurveyFormFields';
import { QuestionBuilder } from './QuestionBuilder';
import { CategorySelector } from './CategorySelector';
import type { CreateSurveyModalProps } from './CreateSurveyModal.types';

const CreateSurveyModal: React.FC<CreateSurveyModalProps> = ({ open, onClose, onCreated }) => {
  const {
    loading, form, questions, selectedCats, categories,
    setFormField, addQuestion, removeQuestion, updateQuestion,
    addOption, updateOption, removeOption, toggleCategory, handleSubmit,
  } = useCreateSurvey(onCreated, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.92, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/5 bg-purple-800 shadow-2xl shadow-black/50">


            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-lienar-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Nueva Encuesta</h2>
                    <p className="text-xs text-white/40">Descubre la opinión de tu audiencia</p>
                  </div>
                </div>
                <button onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="bg-white/2 rounded-2xl p-5 border border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-linear-to-b from-primary-400 to-primary-600 rounded-full" />
                    <span className="text-sm font-bold text-white/80">Información del proyecto</span>
                  </div>
                  <SurveyFormFields form={form} onChange={setFormField} />
                </div>

                <div className="bg-white/2 rounded-2xl p-5 border border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-linear-to-b from-primary-400 to-primary-600 rounded-full" />
                    <span className="text-sm font-bold text-white/80">Preguntas</span>
                  </div>
                  <QuestionBuilder
                    questions={questions}
                    onAdd={addQuestion}
                    onRemove={removeQuestion}
                    onUpdateQuestion={updateQuestion}
                    onAddOption={addOption}
                    onUpdateOption={updateOption}
                    onRemoveOption={removeOption}
                  />
                </div>

                <div className="bg-white/2 rounded-2xl p-5 border border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-linear-to-b from-primary-400 to-primary-600 rounded-full" />
                    <span className="text-sm font-bold text-white/80">Audiencia objetivo</span>
                  </div>
                  <CategorySelector categories={categories} selectedIds={selectedCats} onToggle={toggleCategory} />
                </div>

                <button type="submit" disabled={loading || !form.title}
                  className="w-full py-3.5 bg-linear-to-r from-primary-500 to-primary-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Creando y notificando...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Crear Encuesta y Notificar</>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateSurveyModal;
