import { useState, useEffect, useCallback } from 'react';
import { ownerVerificationService, type PendingVerification } from '@lib/supabase';
import { BadgeCheck, Loader2, RefreshCw, Clock, Sparkles, FileText, CheckCircle, Zap, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { timeAgo } from '../helpers';

export function VerificationsSection() {
  const [items, setItems] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await ownerVerificationService.listPending()); }
    catch (e) { toast.error(e?.message ?? 'Error al cargar verificaciones'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const decide = async (id: string, decision: 'approve' | 'reject') => {
    setActing(id);
    try {
      await ownerVerificationService.review(id, decision, notes[id]);
      setItems(prev => prev.filter(v => v.id !== id));
      toast.success(decision === 'approve' ? 'Verificación aprobada' : 'Verificación rechazada');
    } catch (e) { toast.error(e?.message ?? 'No se pudo procesar'); }
    finally { setActing(null); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
        <div className="p-5 border-b border-stone-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center"><BadgeCheck className="w-4 h-4 text-primary-500" /></div>
          <div className="flex-1"><h3 className="font-bold text-stone-800">Solicitudes de verificación</h3><p className="text-[11px] text-stone-400">Confirmá que hay una persona real detrás.</p></div>
          <button onClick={load} className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600"><RefreshCw className="w-4 h-4" /></button>
        </div>
        {items.length === 0 ? (
          <div className="text-center py-16 text-stone-400"><CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-200" /><p className="text-sm font-medium text-stone-500">No hay solicitudes pendientes</p></div>
        ) : (
          <div className="divide-y divide-stone-50">
            {items.map(v => (
              <div key={v.id} className="p-5 space-y-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <img src={v.userAvatar || '/avatar.png'} alt={v.userName ?? ''}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-stone-100 shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/avatar.png'; }} />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-stone-700 leading-tight">{v.userName ?? v.userId}</span>
                    <span className="text-[11px] text-stone-400 leading-tight">{v.userEmail}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${v.kind === 'identity' ? 'bg-blue-100 text-blue-700' : 'bg-primary-100 text-primary-700'}`}>
                    {v.kind === 'identity' ? <><Sparkles className="w-3 h-3 inline -mt-0.5" /> Identidad</> : <><FileText className="w-3 h-3 inline -mt-0.5" /> Docs</>}
                  </span>
                  <span className="text-stone-300">·</span><Clock className="w-2.5 h-2.5 text-stone-300" />
                  <span className="text-[10px] text-stone-400">{timeAgo(v.createdAt)}</span>
                </div>
                {v.businessName && <p className="text-xs text-stone-500">Negocio: <span className="font-medium text-stone-700">{v.businessName}</span></p>}
                {v.extracted?.claimedName && (
                  <p className="text-xs text-stone-500">
                    Nombre: <span className="font-medium text-stone-700">{String(v.extracted.claimedName)}</span>
                    {v.extracted.nameMatches === false && <span className="ml-1 text-red-500 font-semibold">(IA: no coincide)</span>}
                    {v.extracted.nameMatches === true && <span className="ml-1 text-green-600 font-semibold">(IA: coincide)</span>}
                  </p>
                )}
                <div className="flex items-start gap-2 text-[11px] bg-stone-50 rounded-lg px-3 py-2">
                  <Zap className="w-3.5 h-3.5 text-primary-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-stone-600">IA: </span>
                    {v.aiScore != null && <span className={`font-bold ${v.aiScore >= 0.7 ? 'text-green-600' : v.aiScore >= 0.4 ? 'text-primary-600' : 'text-red-600'}`}>{Math.round(v.aiScore * 100)}% </span>}
                    <span className="text-stone-500">{v.aiNotes ?? 'Sin análisis automático.'}</span>
                  </div>
                </div>
                {v.docUrls.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {v.docUrls.map((u, i) => (
                      <a key={i} href={u} target="_blank" rel="noreferrer" className="w-24 h-24 rounded-xl overflow-hidden border border-stone-200 hover:ring-2 hover:ring-primary-300 transition-all">
                        <img src={u} alt={`doc-${i}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}
                <input value={notes[v.id] ?? ''} onChange={e => setNotes(n => ({ ...n, [v.id]: e.target.value }))}
                  placeholder="Nota para el usuario (opcional)" className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200" />
                <div className="flex gap-2">
                  <button onClick={() => decide(v.id, 'approve')} disabled={acting === v.id}
                    className="flex-1 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                    {acting === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Aprobar
                  </button>
                  <button onClick={() => decide(v.id, 'reject')} disabled={acting === v.id}
                    className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                    <X className="w-4 h-4" /> Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
