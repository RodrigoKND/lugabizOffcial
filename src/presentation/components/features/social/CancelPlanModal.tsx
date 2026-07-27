import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { useLockBodyScroll } from '@presentation/hooks';

interface CancelPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isSubmitting?: boolean;
}

const REASON_CHIPS = [
  'Cambio de planes',
  'Ya no somos suficientes',
  'Mal tiempo',
  'Se pospuso para otra fecha',
  'Ya no puedo ir',
];

const CancelPlanModal: React.FC<CancelPlanModalProps> = ({ isOpen, onClose, onConfirm, isSubmitting }) => {
  useLockBodyScroll(isOpen);
  const [reason, setReason] = useState('');

  const handleClose = () => { setReason(''); onClose(); };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => { e.stopPropagation(); handleClose(); }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-primary-100">
              <h3 className="text-base font-bold text-text-primary">Cancelar plan</h3>
              <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-text-secondary">
                Los que ya habían confirmado van a recibir un aviso con tu motivo. Contales por qué se cancela.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {REASON_CHIPS.map((chip) => (
                  <button key={chip} type="button" onClick={() => setReason(chip)}
                    className={`px-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition-colors ${
                      reason === chip ? 'bg-primary-500 border-primary-500 text-white' : 'border-primary-100 text-text-secondary hover:bg-primary-50/60'
                    }`}>
                    {chip}
                  </button>
                ))}
              </div>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
                placeholder="Escribí el motivo..."
                className="w-full px-4 py-2.5 bg-primary-50/50 border border-primary-100 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-white transition-all resize-none" />
            </div>

            <div className="flex gap-3 p-5 border-t border-primary-100">
              <button onClick={() => onConfirm(reason)} disabled={!reason.trim() || isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-all disabled:opacity-50">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Cancelar plan
              </button>
              <button onClick={handleClose}
                className="flex-1 py-2.5 bg-primary-50 text-text-secondary rounded-xl font-semibold text-sm hover:bg-primary-100 transition-all">
                Volver
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default CancelPlanModal;
