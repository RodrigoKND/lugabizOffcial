import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, Plus, Trash2, Loader2, ScrollText, ChevronLeft } from 'lucide-react';
import { useAuth } from '@presentation/context';
import { ownerBusinessesService, MAX_BUSINESSES, type OwnerBusiness } from '@lib/supabase';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MyBusinessesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [list, setList] = useState<OwnerBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OwnerBusiness | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;
    setLoading(true);
    setAdding(false); setName(''); setAccepted(false);
    ownerBusinessesService.listMine(user.id)
      .then(setList)
      .catch(() => toast.error('No se pudieron cargar tus negocios'))
      .finally(() => setLoading(false));
  }, [isOpen, user]);

  if (!user) return null;

  const reachedMax = list.length >= MAX_BUSINESSES;

  const handleAdd = async () => {
    if (!name.trim() || !accepted || busy) return;
    setBusy(true);
    try {
      const created = await ownerBusinessesService.add(user.id, name.trim());
      setList(prev => [...prev, created]);
      setAdding(false); setName(''); setAccepted(false);
      toast.success('Negocio registrado');
    } catch (e: any) {
      toast.error(e?.message ?? 'No se pudo registrar el negocio.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (biz: OwnerBusiness) => {
    setBusy(true);
    try {
      await ownerBusinessesService.remove(biz.id);
      const next = list.filter(b => b.id !== biz.id);
      setList(next);
      // Si era el negocio "principal" mostrado en el perfil, lo actualizamos.
      if (user.ownerBusinessName === biz.name) {
        await updateProfile({ ownerBusinessName: next[0]?.name ?? '' });
      }
      toast.success('Negocio eliminado');
    } catch {
      toast.error('No se pudo eliminar el negocio.');
    } finally {
      setBusy(false);
      setDeleteTarget(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center justify-between p-5 border-b border-primary-100 shrink-0">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-primary-500" />
                <h3 className="text-base font-bold text-text-primary">Mis negocios</h3>
                <span className="text-xs text-text-secondary">({list.length}/{MAX_BUSINESSES})</span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-primary-400 animate-spin" /></div>
              ) : adding ? (
                <div className="space-y-4">
                  {/* Aviso legal — aceptación obligatoria */}
                  <div className="flex items-start gap-2 p-3 bg-primary-50/60 rounded-xl">
                    <ScrollText className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                    <p className="text-[11.5px] text-text-secondary leading-relaxed">
                      Lugabiz solo brinda <strong>visibilidad</strong> a tu negocio y no promueve ni avala actividades
                      ilegales. Sos responsable de cumplir con las <strong>obligaciones legales y tributarias</strong> que
                      correspondan a tu actividad. Lugabiz no clasifica ni reporta tu situación a ninguna entidad.
                    </p>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)}
                      className="w-4 h-4 rounded border-primary-300 text-primary-500 focus:ring-primary-400" />
                    <span className="text-sm text-text-primary">Entiendo y acepto</span>
                  </label>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Nombre del negocio</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Ej: Cafetería La Esquina"
                      className="w-full px-4 py-2.5 bg-primary-50/50 border border-primary-100 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-white transition-all" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setAdding(false); setName(''); setAccepted(false); }}
                      className="px-4 py-2.5 bg-primary-50 text-text-secondary rounded-xl font-semibold text-sm flex items-center gap-1"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={handleAdd} disabled={!name.trim() || !accepted || busy}
                      className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Registrar negocio
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {list.length === 0 ? (
                    <p className="text-sm text-text-secondary text-center py-6">Todavía no tenés negocios registrados.</p>
                  ) : (
                    <div className="space-y-2">
                      {list.map(biz => (
                        <div key={biz.id} className="flex items-center gap-3 p-3 bg-primary-50/40 border border-primary-100 rounded-xl">
                          <div className="w-9 h-9 rounded-lg bg-white border border-primary-100 flex items-center justify-center shrink-0">
                            <Store className="w-4 h-4 text-primary-400" />
                          </div>
                          <p className="text-sm font-semibold text-text-primary flex-1 min-w-0 truncate">{biz.name}</p>
                          <button onClick={() => setDeleteTarget(biz)} disabled={busy}
                            className="p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {reachedMax ? (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2.5 text-center">
                      Llegaste al máximo de {MAX_BUSINESSES} negocios. Eliminá uno para registrar otro.
                    </p>
                  ) : (
                    <button onClick={() => setAdding(true)}
                      className="w-full py-2.5 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all flex items-center justify-center gap-1.5">
                      <Plus className="w-4 h-4" /> Registrar otro negocio
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>

          <ConfirmDialog
            open={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
            title="Eliminar negocio"
            message={`¿Eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
            confirmLabel="Eliminar"
            variant="danger"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MyBusinessesModal;
