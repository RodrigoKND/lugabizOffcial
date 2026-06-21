import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const variants = {
  danger: { icon: 'text-red-500', bg: 'bg-red-50', btn: 'bg-red-500 hover:bg-red-600', border: 'border-red-100' },
  warning: { icon: 'text-amber-500', bg: 'bg-amber-50', btn: 'bg-amber-500 hover:bg-amber-600', border: 'border-amber-100' },
  info: { icon: 'text-blue-500', bg: 'bg-blue-50', btn: 'bg-blue-500 hover:bg-blue-600', border: 'border-blue-100' },
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Eliminar', cancelLabel = 'Cancelar', variant = 'danger',
}) => {
  const v = variants[variant];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, pointerEvents: 'auto' }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-stone-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${v.bg} flex items-center justify-center`}>
                <AlertTriangle className={`w-5 h-5 ${v.icon}`} />
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors">
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-stone-800 mb-1">{title}</h3>
            <p className="text-sm text-stone-500 mb-6 leading-relaxed">{message}</p>

            <div className="flex gap-3">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold text-sm hover:bg-stone-50 transition-all">
                {cancelLabel}
              </button>
              <button onClick={() => { onConfirm(); onClose(); }}
                className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-all shadow-sm ${v.btn}`}>
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
