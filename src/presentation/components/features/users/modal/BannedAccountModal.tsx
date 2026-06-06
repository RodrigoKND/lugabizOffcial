import { motion } from 'framer-motion';
import { ShieldOff, AlertTriangle } from 'lucide-react';

interface BannedAccountModalProps {
  reason: string;
  onDismiss: () => void;
}

const BannedAccountModal: React.FC<BannedAccountModalProps> = ({ reason, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
  >
    <motion.div
      initial={{ scale: 0.88, opacity: 0, y: 24 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
    >
      {/* Banda de alerta superior */}
      <div className="bg-red-500 px-6 py-5 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <ShieldOff className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold text-lg leading-tight">Cuenta suspendida</h2>
          <p className="text-red-100 text-xs mt-0.5">Tu acceso ha sido restringido</p>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="p-6">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-red-700 mb-0.5">Motivo de la suspensión</p>
              <p className="text-sm text-red-600">{reason}</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-stone-500 text-center leading-relaxed mb-6">
          Tu cuenta ha sido suspendida por el equipo de administración.
          Si crees que esto es un error, puedes contactar al soporte.
        </p>

        <button
          onClick={onDismiss}
          className="w-full py-3 rounded-2xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 active:scale-[0.98] transition-all"
        >
          Entendido
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default BannedAccountModal;
