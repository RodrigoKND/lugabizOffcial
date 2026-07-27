import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { placeFakeReportsService } from '@lib/supabase';
import { useLockBodyScroll } from '@presentation/hooks';

interface AppealHiddenPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeId: string;
}

const AppealHiddenPlaceModal: React.FC<AppealHiddenPlaceModalProps> = ({ isOpen, onClose, placeId }) => {
  useLockBodyScroll(isOpen);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await placeFakeReportsService.appeal(placeId, message);
      toast.success('Apelación enviada. Un admin la va a revisar.');
      setMessage('');
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'No se pudo enviar la apelación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); onClose(); }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-primary-100">
              <h3 className="text-base font-bold text-text-primary">Apelar</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-text-secondary">
                Contale al admin por qué creés que tu lugar fue ocultado por error. Un admin lo va a revisar.
              </p>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} autoFocus
                placeholder="Ej: es un negocio real, tengo documentos que lo respaldan..."
                className="w-full px-4 py-2.5 bg-primary-50/50 border border-primary-100 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-white transition-all resize-none" />
            </div>
            <div className="flex gap-3 p-5 border-t border-primary-100">
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all disabled:opacity-50">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Enviar apelación
              </button>
              <button onClick={onClose}
                className="flex-1 py-2.5 bg-primary-50 text-text-secondary rounded-xl font-semibold text-sm hover:bg-primary-100 transition-all">
                Cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AppealHiddenPlaceModal;
