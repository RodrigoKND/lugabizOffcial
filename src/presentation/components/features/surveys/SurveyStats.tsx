import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Users, BarChart3, Clock, UserCheck, TrendingUp } from 'lucide-react';
import { MarketSurvey } from '@domain/entities';
import { marketSurveysService } from '@lib/supabase';

interface SurveyStatsProps {
  survey: MarketSurvey;
  onClose: () => void;
}

const SurveyStats: React.FC<SurveyStatsProps> = ({ survey, onClose }) => {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    marketSurveysService.getResponses(survey.id)
      .then(setResponses)
      .finally(() => setLoading(false));
  }, [survey.id]);

  const daysAgo = Math.floor((Date.now() - survey.createdAt.getTime()) / 86400000);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-800">{survey.title}</h2>
              <p className="text-xs text-stone-400">Estadísticas de encuesta</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200">
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-amber-50 rounded-xl p-3 text-center">
              <Users className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-stone-800">{survey.responseCount}</p>
              <p className="text-[10px] text-stone-500 font-medium">Respuestas</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-stone-800">{daysAgo}d</p>
              <p className="text-[10px] text-stone-500 font-medium">Activa</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-stone-800">{responses.length}</p>
              <p className="text-[10px] text-stone-500 font-medium">Hoy</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase mb-3">Progreso de respuestas</p>
            <div className="bg-stone-100 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(survey.responseCount / 50 * 100, 100)}%` }}
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">
              {survey.responseCount} de ~50 respuestas estimadas
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase mb-3">
              Últimas respuestas ({responses.length})
            </p>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : responses.length === 0 ? (
              <div className="text-center py-6 bg-stone-50 rounded-2xl">
                <UserCheck className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-sm text-stone-400 font-medium">Sin respuestas aún</p>
              </div>
            ) : (
              <div className="space-y-2">
                {responses.slice(0, 10).map((r, i) => (
                  <div key={r.id} className="flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-2.5">
                    <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600">
                      {r.userName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-700 truncate">{r.userName}</p>
                      <p className="text-[10px] text-stone-400">{r.createdAt.toLocaleDateString()}</p>
                    </div>
                    <span className="text-[10px] text-stone-400 font-medium">#{i + 1}</span>
                  </div>
                ))}
                {responses.length > 10 && (
                  <p className="text-center text-xs text-stone-400">+{responses.length - 10} más</p>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SurveyStats;
