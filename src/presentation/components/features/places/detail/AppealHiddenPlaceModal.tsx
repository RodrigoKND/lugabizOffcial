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
            className="bg-lg-surface rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-lg-surface-2">
              <h3 className="text-base font-bold text-lg-text">Apelar</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-lg-surface-2 transition-colors">
                <X className="w-4 h-4 text-lg-dim" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-lg-dim">
                Contale al admin por qué creés que tu lugar fue ocultado por error. Un admin lo va a revisar.
              </p>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} autoFocus
                placeholder="Ej: es un negocio real, tengo documentos que lo respaldan..."
                className="w-full px-4 py-2.5 bg-lg-surface-2 border border-lg-surface-2 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-lg-surface transition-all resize-none" />
            </div>
            <div className="flex gap-3 p-5 border-t border-lg-surface-2">
              <button onClick={handleSubmit} disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-lg-accent text-lg-ink rounded-xl font-semibold text-sm hover:bg-lg-accent transition-all disabled:opacity-50">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Enviar apelación
              </button>
              <button onClick={onClose}
                className="flex-1 py-2.5 bg-lg-surface-2 text-lg-dim rounded-xl font-semibold text-sm hover:bg-lg-surface-2 transition-all">
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
