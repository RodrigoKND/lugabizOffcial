import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, BarChart3, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { MarketSurvey, SurveyResponse } from '@domain/entities';
import { marketSurveysService } from '@lib/supabase';
import QuestionChart from './QuestionChart';

interface SurveyStatsProps {
  survey: MarketSurvey;
  onClose: () => void;
}

const SurveyStats: React.FC<SurveyStatsProps> = ({ survey, onClose }) => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState<string | null>(survey.questions[0]?.id ?? null);
  const [showUsers, setShowUsers] = useState(false);

  useEffect(() => {
    marketSurveysService.getResponses(survey.id)
      .then(setResponses)
      .finally(() => setLoading(false));
  }, [survey.id]);

  const daysAgo = Math.floor((Date.now() - survey.createdAt.getTime()) / 86400000);
  const todayStr = new Date().toISOString().split('T')[0];
  const today = responses.filter(r => r.createdAt.toISOString().startsWith(todayStr)).length;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-lg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-lg-surface rounded-t-3xl px-5 pt-5 pb-3 border-b border-lg-surface-2 z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-lg-accent flex items-center justify-center shrink-0">
                <BarChart3 className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-lg-text leading-tight">{survey.title}</h2>
                <p className="text-[11px] text-lg-dim mt-0.5">Estadísticas de encuesta</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-lg-surface-2 flex items-center justify-center hover:bg-lg-surface-2 shrink-0">
              <X className="w-4 h-4 text-lg-dim" />
            </button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <Users className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <p className="text-[22px] font-bold text-lg-text leading-none">{survey.responseCount}</p>
              <p className="text-[10px] text-lg-dim font-medium mt-0.5">Total</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <p className="text-[22px] font-bold text-lg-text leading-none">{daysAgo}d</p>
              <p className="text-[10px] text-lg-dim font-medium mt-0.5">Activa</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <BarChart3 className="w-4 h-4 text-green-500 mx-auto mb-1" />
              <p className="text-[22px] font-bold text-lg-text leading-none">{today}</p>
              <p className="text-[10px] text-lg-dim font-medium mt-0.5">Hoy</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-[12px] text-lg-dim">Cargando respuestas…</p>
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-10">
              <BarChart3 className="w-10 h-10 text-stone-200 mx-auto mb-2" />
              <p className="text-[14px] font-semibold text-lg-dim">Sin respuestas aún</p>
              <p className="text-[12px] text-lg-dim mt-1">Los gráficos aparecerán cuando lleguen respuestas</p>
            </div>
          ) : (
            <>
              {/* Gráficos por pregunta */}
              <div>
                <p className="text-[11px] font-bold text-lg-dim uppercase tracking-wider mb-3">
                  Resultados por pregunta
                </p>
                <div className="space-y-2">
                  {survey.questions.map((q, idx) => (
                    <div key={q.id} className="border border-lg-surface-2 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-lg-surface-2 hover:bg-lg-surface-2 transition-colors text-left"
                      >
                        <span className="text-[12px] font-semibold text-lg-dim truncate flex-1 pr-2">
                          {idx + 1}. {q.question}
                        </span>
                        {expandedQ === q.id
                          ? <ChevronUp className="w-4 h-4 text-lg-dim shrink-0" />
                          : <ChevronDown className="w-4 h-4 text-lg-dim shrink-0" />
                        }
                      </button>
                      <AnimatePresence>
                        {expandedQ === q.id && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 py-3">
                              <QuestionChart question={q} responses={responses} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lista de usuarios que respondieron */}
              <div>
                <button
                  onClick={() => setShowUsers(v => !v)}
                  className="w-full flex items-center justify-between py-2"
                >
                  <p className="text-[11px] font-bold text-lg-dim uppercase tracking-wider">
                    Usuarios que respondieron ({responses.length})
                  </p>
                  {showUsers
                    ? <ChevronUp className="w-4 h-4 text-lg-dim" />
                    : <ChevronDown className="w-4 h-4 text-lg-dim" />
                  }
                </button>
                <AnimatePresence>
                  {showUsers && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1.5 pt-1">
                        {responses.slice(0, 20).map((r, i) => (
                          <div key={r.id} className="flex items-center gap-3 bg-lg-surface-2 rounded-xl px-3 py-2.5">
                            <div className="w-7 h-7 rounded-full bg-lg-surface-2 flex items-center justify-center text-[11px] font-bold text-lg-dim shrink-0">
                              {r.userName?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-lg-text truncate">{r.userName ?? 'Usuario'}</p>
                              <p className="text-[10px] text-lg-dim">
                                {r.createdAt.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                                {' · '}{(r.answers ?? []).length} respuestas
                              </p>
                            </div>
                            <span className="text-[10px] text-lg-dim font-medium shrink-0">#{i + 1}</span>
                          </div>
                        ))}
                        {responses.length > 20 && (
                          <p className="text-center text-[11px] text-lg-dim py-2">+{responses.length - 20} más</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SurveyStats;
