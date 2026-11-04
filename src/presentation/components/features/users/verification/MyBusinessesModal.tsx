import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, Plus, Trash2, Loader2, ScrollText, ChevronLeft, FileCheck2, BadgeCheck, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@presentation/context';
import { ownerBusinessesService, ownerVerificationService, MAX_BUSINESSES, type OwnerBusiness } from '@lib/supabase';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import DocPicker from './DocPicker';
import StatusBadge from './StatusBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MyBusinessesModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [list, setList] = useState<OwnerBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'add' | 'verify'>('list');
  const [name, setName] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OwnerBusiness | null>(null);
  // Negocio que se está verificando + sus documentos.
  const [verifyTarget, setVerifyTarget] = useState<OwnerBusiness | null>(null);
  const [docFiles, setDocFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!isOpen || !user) return;
    setLoading(true);
    setView('list'); setName(''); setAccepted(false); setVerifyTarget(null); setDocFiles([]);
    ownerBusinessesService.listMine(user.id)
      .then(loaded => {
        setList(loaded);
        // Auto-reparar: si el "negocio principal" del perfil apunta a uno que ya
        // no existe en la lista (p. ej. lo eliminaste), lo reapuntamos al primero
        // disponible. Evita que el wizard de verificación muestre un negocio borrado.
        if (user.ownerBusinessName && !loaded.some(b => b.name === user.ownerBusinessName)) {
          updateProfile({ ownerBusinessName: loaded[0]?.name ?? '' }).catch(() => {});
        }
      })
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
      const next = [...list, created];
      setList(next);
      // Mantener sincronizado el "negocio principal" del perfil (users.owner_business_name).
      if (!user.ownerBusinessName || !next.some(b => b.name === user.ownerBusinessName)) {
        await updateProfile({ ownerBusinessName: next[0]?.name ?? created.name });
      }
      setName(''); setAccepted(false);
      // Cada negocio es una entidad: tras registrarlo, lo llevamos directo al paso
      // de subir sus documentos (puede saltarlo y hacerlo después).
      setVerifyTarget(created); setDocFiles([]); setView('verify');
      toast.success('Negocio registrado');
    } catch (e) {
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

  const openVerify = (biz: OwnerBusiness) => {
    setVerifyTarget(biz); setDocFiles([]); setView('verify');
  };

  const submitDocs = async () => {
    if (!verifyTarget || docFiles.length === 0 || busy) return;
    setBusy(true);
    try {
      await ownerVerificationService.submitBusinessDocs(user.id, {
        businessId: verifyTarget.id, businessName: verifyTarget.name, docFiles,
      });
      // Marcamos el negocio "en revisión" localmente (el backend ya lo puso pending).
      setList(prev => prev.map(b => b.id === verifyTarget.id ? { ...b, docsStatus: 'pending' } : b));
      toast.success('Documentos enviados a revisión');
      setView('list'); setVerifyTarget(null); setDocFiles([]);
    } catch (e) {
      toast.error(e?.message ?? 'No se pudieron enviar los documentos.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-lg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center justify-between p-5 border-b border-lg-surface-2 shrink-0">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-lg-accent" />
                <h3 className="text-base font-bold text-lg-text">Mis negocios</h3>
                <span className="text-xs text-lg-dim">({list.length}/{MAX_BUSINESSES})</span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-lg-surface-2 transition-colors">
                <X className="w-4 h-4 text-lg-dim" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-lg-accent animate-spin" /></div>
              ) : view === 'add' ? (
                <div className="space-y-4">
                  {/* Aviso legal — aceptación obligatoria */}
                  <div className="flex items-start gap-2 p-3 bg-lg-surface-2 rounded-xl">
                    <ScrollText className="w-5 h-5 text-lg-accent shrink-0 mt-0.5" />
                    <p className="text-[11.5px] text-lg-dim leading-relaxed">
                      Lugabiz solo brinda <strong>visibilidad</strong> a tu negocio y no promueve ni avala actividades
                      ilegales. Sos responsable de cumplir con las <strong>obligaciones legales y tributarias</strong> que
                      correspondan a tu actividad. Lugabiz no clasifica ni reporta tu situación a ninguna entidad.
                    </p>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)}
                      className="w-4 h-4 rounded border-primary-300 text-lg-accent focus:ring-primary-400" />
                    <span className="text-sm text-lg-text">Entiendo y acepto</span>
                  </label>
                  <div>
                    <label className="block text-xs font-semibold text-lg-dim uppercase mb-1.5">Nombre del negocio</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Ej: Cafetería La Esquina"
                      className="w-full px-4 py-2.5 bg-lg-surface-2 border border-lg-surface-2 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-lg-surface transition-all" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setView('list'); setName(''); setAccepted(false); }}
                      className="px-4 py-2.5 bg-lg-surface-2 text-lg-dim rounded-xl font-semibold text-sm flex items-center gap-1"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={handleAdd} disabled={!name.trim() || !accepted || busy}
                      className="flex-1 py-2.5 bg-lg-accent text-lg-ink rounded-xl font-semibold text-sm hover:bg-lg-accent transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Registrar negocio
                    </button>
                  </div>
                </div>
              ) : view === 'verify' && verifyTarget ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      Subí los documentos de <strong>{verifyTarget.name}</strong> (NIT, SEPREC o licencia) para obtener su
                      <strong> insignia dorada</strong> de negocio verificado. Cada negocio se verifica por separado. Es
                      opcional: podés hacerlo después.
                    </p>
                  </div>
                  <DocPicker label="Documento de negocio" hint="NIT / SEPREC / licencia"
                    file={docFiles[0] ?? null}
                    onSelect={(f) => setDocFiles(f ? [f, ...docFiles.slice(1)] : docFiles.slice(1))} />
                  {docFiles.length > 0 && (
                    <DocPicker label="Otro documento — opcional" hint="Agregar otro"
                      file={docFiles[1] ?? null}
                      onSelect={(f) => setDocFiles(f ? [docFiles[0], f] : [docFiles[0]])} />
                  )}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => { setView('list'); setVerifyTarget(null); setDocFiles([]); }}
                      className="px-4 py-2.5 bg-lg-surface-2 text-lg-dim rounded-xl font-semibold text-sm">Después</button>
                    <button onClick={submitDocs} disabled={docFiles.length === 0 || busy}
                      className="flex-1 py-2.5 bg-lg-accent text-lg-ink rounded-xl font-semibold text-sm hover:bg-lg-accent transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck2 className="w-4 h-4" />} Enviar a revisión
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {list.length === 0 ? (
                    <p className="text-sm text-lg-dim text-center py-6">Todavía no tenés negocios registrados.</p>
                  ) : (
                    <div className="space-y-2">
                      {list.map(biz => (
                        <div key={biz.id} className="flex items-center gap-3 p-3 bg-lg-surface-2 border border-lg-surface-2 rounded-xl">
                          <div className="w-9 h-9 rounded-lg bg-lg-surface border border-lg-surface-2 flex items-center justify-center shrink-0">
                            <Store className="w-4 h-4 text-lg-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-lg-text truncate">{biz.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <StatusBadge status={biz.docsStatus} />
                              {(biz.docsStatus === 'none' || biz.docsStatus === 'rejected') && (
                                <button onClick={() => openVerify(biz)}
                                  className="text-[11px] font-semibold text-lg-accent hover:text-lg-accent hover:underline">
                                  {biz.docsStatus === 'rejected' ? 'Reintentar verificación' : 'Verificar negocio'}
                                </button>
                              )}
                            </div>
                          </div>
                          <button onClick={() => setDeleteTarget(biz)} disabled={busy}
                            className="p-2 rounded-lg text-lg-dim hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50 shrink-0">
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
                    <button onClick={() => setView('add')}
                      className="w-full py-2.5 bg-lg-accent text-lg-ink rounded-xl font-semibold text-sm hover:bg-lg-accent transition-all flex items-center justify-center gap-1.5">
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
