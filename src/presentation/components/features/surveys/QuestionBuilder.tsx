import { motion } from 'framer-motion';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import type { SurveyQuestion } from '@domain/entities';

interface QuestionBuilderProps {
  questions: SurveyQuestion[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdateQuestion: (id: string, value: string) => void;
  onAddOption: (qId: string) => void;
  onUpdateOption: (qId: string, oIdx: number, value: string) => void;
  onRemoveOption: (qId: string, oIdx: number) => void;
}

export function QuestionBuilder({
  questions, onAdd, onRemove, onUpdateQuestion, onAddOption, onUpdateOption, onRemoveOption,
}: QuestionBuilderProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Preguntas</span>
        <button type="button" onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500/15 text-primary-300 rounded-lg text-xs font-bold hover:bg-primary-500/25 transition-all">
          <Plus className="w-3.5 h-3.5" /> Agregar
        </button>
      </div>
      <div className="space-y-3">
        {questions.map((q, qi) => (
          <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-primary-500/20 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 mt-0.5 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4 text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <input type="text" value={q.question}
                  onChange={(e) => onUpdateQuestion(q.id, e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/20 outline-none focus:border-primary-400/50 transition-all"
                  placeholder={`Pregunta ${qi + 1}`} />
                <div className="mt-3 space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white/30 w-5 text-right font-mono">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <input type="text" value={opt}
                        onChange={(e) => onUpdateOption(q.id, oi, e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-xs text-white/80 placeholder-white/15 outline-none focus:border-primary-400/50 transition-all"
                        placeholder={`Opción ${String.fromCharCode(65 + oi)}`} />
                      {q.options.length > 2 && (
                        <button type="button" onClick={() => onRemoveOption(q.id, oi)}
                          className="p-1 hover:bg-red-500/10 rounded transition-colors">
                          <Trash2 className="w-3 h-3 text-red-400/70" />
                        </button>
                      )}
                    </div>
                  ))}
                  {q.options.length < 4 && (
                    <button type="button" onClick={() => onAddOption(q.id)}
                      className="text-xs text-primary-400/70 hover:text-primary-400 font-medium transition-colors ml-7">
                      + Agregar opción
                    </button>
                  )}
                </div>
              </div>
              <button type="button" onClick={() => onRemove(q.id)}
                className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                <Trash2 className="w-3.5 h-3.5 text-red-400/60" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
