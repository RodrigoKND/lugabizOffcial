import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader2, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { marketSurveysService } from '@lib/supabase';
import { useAuth, usePlaces } from '@presentation/context';

interface CreateSurveyModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateSurveyModal: React.FC<CreateSurveyModalProps> = ({ open, onClose, onCreated }) => {
  const { user } = useAuth();
  const { categories } = usePlaces();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    about: '',
    benefit: '',
    problemSolved: '',
  });
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (selectedCats.length === 0) { toast.error('Selecciona al menos una categoría objetivo'); return; }
    setLoading(true);
    try {
      const survey = await marketSurveysService.create({
        ...form,
        categoryIds: selectedCats,
      }, user.id);
      await marketSurveysService.notifyUsers(survey.id, selectedCats);
      toast.success('Encuesta creada y notificaciones enviadas');
      onCreated();
      onClose();
    } catch {
      toast.error('Error al crear encuesta');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

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
              <h2 className="text-lg font-bold text-stone-800">Nueva Encuesta de Mercado</h2>
              <p className="text-xs text-stone-500">Investigación de producto o servicio</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200">
            <X className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase">Título del proyecto/servicio</label>
            <input type="text" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-400 mt-1"
              placeholder="Ej. Nueva app de delivery" />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase">Descripción breve</label>
            <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-400 mt-1 resize-none" rows={2}
              placeholder="Describe tu proyecto en pocas palabras" />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase">¿De qué se trata?</label>
            <textarea value={form.about} onChange={(e) => setForm(f => ({ ...f, about: e.target.value }))}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-400 mt-1 resize-none" rows={2}
              placeholder="Explica de qué va tu proyecto" />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase">¿Qué beneficio ofrece?</label>
            <textarea value={form.benefit} onChange={(e) => setForm(f => ({ ...f, benefit: e.target.value }))}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-400 mt-1 resize-none" rows={2}
              placeholder="¿Qué valor aporta a los usuarios?" />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase">¿Qué problema resuelve?</label>
            <textarea value={form.problemSolved} onChange={(e) => setForm(f => ({ ...f, problemSolved: e.target.value }))}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:border-amber-400 mt-1 resize-none" rows={2}
              placeholder="¿Qué necesidad cubre?" />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-500 uppercase">Categorías objetivo</label>
            <p className="text-[11px] text-stone-400 mb-2">Se notificará a usuarios que eligieron estas categorías</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button key={cat.id} type="button" onClick={() =>
                  setSelectedCats(prev => prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id])}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedCats.includes(cat.id)
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-amber-300'
                  }`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading || !form.title || !form.description}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {loading ? 'Creando y notificando...' : 'Crear Encuesta y Notificar'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateSurveyModal;
