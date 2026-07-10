import { motion } from 'framer-motion';
import { Loader2, ShieldAlert } from 'lucide-react';

export function RevokeModal({ revoke, acting, reason, onClose, onReasonChange, onConfirm }: {
  revoke: { target: string; title: string; message: string } | null;
  acting: string | null;
  reason: string;
  onClose: () => void;
  onReasonChange: (v: string) => void;
  onConfirm: () => void;
}) {
  if (!revoke) return null;
  return (
    <motion.div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
        initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} onClick={e => e.stopPropagation()}>
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0"><ShieldAlert className="w-4 h-4 text-red-500" /></div>
            <h3 className="font-bold text-stone-800 text-sm">{revoke.title}</h3>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">{revoke.message}</p>
          <textarea value={reason} onChange={e => onReasonChange(e.target.value)} placeholder="Motivo para el dueño (opcional)" rows={2}
            className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary-200" />
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl bg-stone-100 text-stone-600 text-sm font-semibold hover:bg-stone-200 transition-colors">Cancelar</button>
            <button onClick={onConfirm} disabled={acting != null}
              className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
              {acting != null ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />} Retirar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
