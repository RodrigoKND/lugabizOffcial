import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ownerVerificationService, ownerBusinessesService, type AdminOwnerBusiness } from '@lib/supabase';
import { Store, Loader2, RefreshCw, Trash2, ShieldAlert, BadgeCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import { DOCS_BADGE } from '../constants';
import { RevokeModal } from './_RevokeModal';

export function BusinessesSection() {
  const [items, setItems] = useState<AdminOwnerBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [target, setTarget] = useState<AdminOwnerBusiness | null>(null);
  const [revoke, setRevoke] = useState<{ target: 'business_docs' | 'identity'; businessId?: string; ownerId?: string; title: string; message: string } | null>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await ownerBusinessesService.listAllForAdmin()); }
    catch (e) { toast.error(e?.message ?? 'Error al cargar negocios'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (biz: AdminOwnerBusiness) => {
    setActing(biz.id);
    try { await ownerBusinessesService.removeForAdmin(biz.id); setItems(prev => prev.filter(b => b.id !== biz.id)); toast.success('Negocio eliminado'); }
    catch (e) { toast.error(e?.message ?? 'No se pudo eliminar'); }
    finally { setActing(null); setTarget(null); }
  };

  const doRevoke = async () => {
    if (!revoke) return;
    const key = revoke.target === 'identity' ? `id-${revoke.ownerId}` : `docs-${revoke.businessId}`;
    setActing(key);
    try {
      await ownerVerificationService.revokeBadge({ target: revoke.target, businessId: revoke.businessId, ownerId: revoke.ownerId, notes: reason.trim() || undefined });
      toast.success('Insignia retirada. Se avisó al dueño.'); setRevoke(null); setReason(''); await load();
    } catch (e) { toast.error(e?.message ?? 'No se pudo retirar la insignia'); }
    finally { setActing(null); }
  };

  const groups = items.reduce<Record<string, { name?: string; email?: string; list: AdminOwnerBusiness[] }>>((acc, b) => {
    (acc[b.userId] ??= { name: b.ownerName, email: b.ownerEmail, list: [] }).list.push(b); return acc;
  }, {});

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
        <div className="p-5 border-b border-stone-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center"><Store className="w-4 h-4 text-primary-500" /></div>
          <div className="flex-1"><h3 className="font-bold text-stone-800">Negocios registrados</h3><p className="text-[11px] text-stone-400">{items.length} negocio(s) · {Object.keys(groups).length} dueño(s)</p></div>
          <button onClick={load} className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600"><RefreshCw className="w-4 h-4" /></button>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-16 text-stone-400"><Store className="w-10 h-10 mx-auto mb-3 text-stone-200" /><p className="text-sm font-medium text-stone-500">No hay negocios registrados</p></div>
        ) : (
          <div className="divide-y divide-stone-50">
            {Object.entries(groups).map(([uid, g]) => (
              <div key={uid} className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-stone-700">{g.name ?? uid}</span>
                  <span className="text-[11px] text-stone-400">{g.email}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700">{g.list.length}/3</span>
                  <button onClick={() => { setReason(''); setRevoke({ target: 'identity', ownerId: uid, title: 'Retirar verificación de identidad', message: `Se quitará la verificación de la cuenta de ${g.name ?? 'este dueño'}.` }); }}
                    disabled={acting === `id-${uid}`}
                    className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50">
                    {acting === `id-${uid}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldAlert className="w-3 h-3" />} Retirar identidad
                  </button>
                </div>
                <div className="space-y-1.5">
                  {g.list.map(biz => {
                    const badge = DOCS_BADGE[biz.docsStatus] ?? DOCS_BADGE.none;
                    return (
                      <div key={biz.id} className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-lg">
                        <Store className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="text-sm text-stone-700 flex-1 min-w-0 truncate">{biz.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${badge.cls}`}>{badge.label}</span>
                        {biz.docsStatus === 'approved' && (
                          <button onClick={() => { setReason(''); setRevoke({ target: 'business_docs', businessId: biz.id, title: 'Retirar insignia dorada', message: `La insignia de "${biz.name}" volverá a estado emergente.` }); }}
                            disabled={acting === `docs-${biz.id}`} title="Retirar insignia dorada"
                            className="p-1.5 rounded-lg text-amber-500 hover:text-amber-700 hover:bg-amber-50 transition-all disabled:opacity-50">
                            {acting === `docs-${biz.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BadgeCheck className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button onClick={() => setTarget(biz)} disabled={acting === biz.id} title="Eliminar negocio"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50">
                          {acting === biz.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmDialog open={!!target} onClose={() => setTarget(null)} onConfirm={() => target && remove(target)}
        title="Eliminar negocio" message={`¿Eliminar "${target?.name}" de ${target?.ownerName ?? 'este dueño'}?`} confirmLabel="Eliminar" variant="danger" />
      <AnimatePresence><RevokeModal revoke={revoke} acting={acting} reason={reason} onClose={() => setRevoke(null)} onReasonChange={setReason} onConfirm={doRevoke} /></AnimatePresence>
    </div>
  );
}
