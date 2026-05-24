import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, BarChart3, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { MarketSurvey } from '@domain/entities';
import { marketSurveysService } from '@lib/supabase';
import { useAuth } from '@presentation/context';

interface SurveyCardProps {
  survey: MarketSurvey;
  onClose: () => void;
  onResponded: () => void;
}

const SurveyCard: React.FC<SurveyCardProps> = ({ survey, onClose, onResponded }) => {
  const { user } = useAuth();
  const [responded, setResponded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRespond = async () => {
    if (!user) { toast.error('Inicia sesión para responder'); return; }
    setLoading(true);
    try {
      await marketSurveysService.respond(survey.id, user.id);
      setResponded(true);
      toast.success('Respuesta enviada!');
      onResponded();
      setTimeout(onClose, 1500);
    } catch {
      toast.error('Ya respondiste esta encuesta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden"
    >
      <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400" />

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-stone-800 text-base">Encuesta de Mercado</h3>
              <p className="text-[11px] text-stone-400">Tu opinión es importante</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200">
            <X className="w-3.5 h-3.5 text-stone-500" />
          </button>
        </div>

        {responded ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-stone-700">¡Gracias por tu respuesta!</p>
            <p className="text-xs text-stone-400 mt-1">Tu opinión ayudará a mejorar</p>
          </div>
        ) : (
          <>
            <h4 className="text-xl font-bold text-stone-800 mb-3">{survey.title}</h4>
            <p className="text-sm text-stone-600 mb-4">{survey.description}</p>

            <div className="space-y-3 mb-5">
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-stone-400 uppercase">¿De qué se trata?</p>
                <p className="text-sm text-stone-700 mt-0.5">{survey.about}</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-stone-400 uppercase">Beneficio</p>
                <p className="text-sm text-stone-700 mt-0.5">{survey.benefit}</p>
              </div>
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-stone-400 uppercase">Problema que resuelve</p>
                <p className="text-sm text-stone-700 mt-0.5">{survey.problemSolved}</p>
              </div>
            </div>

            <button onClick={handleRespond} disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              {loading ? 'Enviando...' : 'Responder Encuesta'}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default SurveyCard;
