import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@presentation/components/ui/button';
import type { ConfirmDialogProps } from '@domain/entities/ui/ModalProps';

const variantStyles = {
  danger: { icon: 'text-red-500', bg: 'bg-red-50', btn: 'danger', border: 'border-red-100' },
  warning: { icon: 'text-amber-500', bg: 'bg-amber-50', btn: 'warning' as const, border: 'border-amber-100' },
  info: { icon: 'text-blue-500', bg: 'bg-blue-50', btn: 'primary' as const, border: 'border-blue-100' },
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Eliminar', cancelLabel = 'Cancelar', variant = 'danger',
}) => {
  const v = variantStyles[variant];

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
              <Button variant="secondary" size="lg" fullWidth onClick={onClose}>
                {cancelLabel}
              </Button>
              <Button variant={v.btn === 'danger' ? 'danger' : v.btn === 'warning' ? 'primary' : 'primary'} size="lg" fullWidth
                onClick={() => { onConfirm(); onClose(); }}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
