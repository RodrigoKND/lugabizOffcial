import { motion } from 'framer-motion';
import { Loader2, Ban, UserX, X, AlertTriangle } from 'lucide-react';
import { BAN_REASONS } from '../constants';

export function BanModal({ banModal, banning, banReason, onClose, onReasonChange, onConfirm }: {
  banModal: { id: string; name: string } | null;
  banning: string | null;
  banReason: string;
  onClose: () => void;
  onReasonChange: (v: string) => void;
  onConfirm: () => void;
}) {
  if (!banModal) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()} className="bg-lg-surface rounded-3xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center"><UserX className="w-5 h-5 text-red-500" /></div>
          <div><h3 className="font-bold text-lg-text">Banear usuario</h3><p className="text-xs text-lg-dim">{banModal.name}</p></div>
          <button onClick={onClose} className="ml-auto p-1.5 hover:bg-lg-surface-2 rounded-lg transition-colors"><X className="w-4 h-4 text-lg-dim" /></button>
        </div>
        <label className="text-xs font-bold text-lg-dim uppercase tracking-wide mb-2 block">Motivo de suspensión</label>
        <select value={banReason} onChange={e => onReasonChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-lg-surface-2 border border-lg-surface-2 rounded-xl text-sm focus:outline-none focus:border-primary-400 mb-4">
          <option value="">Seleccionar motivo...</option>
          {BAN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <div className="bg-lg-surface-2 border border-lg-surface-2 rounded-xl p-3 mb-5">
          <div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-lg-accent mt-0.5 shrink-0" /><p className="text-xs text-lg-accent">El usuario recibirá una notificación informando el motivo de la suspensión.</p></div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-lg-surface-2 text-lg-dim rounded-xl text-sm font-semibold hover:bg-lg-surface-2 transition-colors">Cancelar</button>
          <button onClick={onConfirm} disabled={!banReason || banning === banModal.id}
            className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {banning === banModal.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />} Banear
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
