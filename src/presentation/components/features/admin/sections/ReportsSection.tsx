import { useState, useEffect, useCallback } from 'react';
import { reportsService } from '@lib/supabase/services/reports';
import { adminService } from '@lib/supabase/services/admin/admin';
import { Flag, Loader2, Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import type { FlaggedContent } from '@domain/entities';

export function ReportsSection() {
  const [flagged, setFlagged] = useState<FlaggedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [banning, setBanning] = useState<string | null>(null);
  const [confirmBanItem, setConfirmBanItem] = useState<FlaggedContent | null>(null);

  const loadFlagged = useCallback(async () => {
    setLoading(true);
    try { setFlagged(await reportsService.getFlaggedContent()); }
    catch { toast.error('Error al cargar reportes'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadFlagged(); }, [loadFlagged]);

  const handleBanFromContent = async (item: FlaggedContent) => {
    setBanning(item.authorId);
    try {
      await adminService.banUserFromContent(item.authorId, item.latestReason, { targetId: item.targetId, targetType: item.targetType, content: item.content });
      setFlagged(prev => prev.filter(f => f.targetId !== item.targetId));
      toast.success(`Usuario baneado: ${item.authorName}`);
    } catch { toast.error('Error al banear'); }
    finally { setBanning(null); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-lg-accent" /></div>;

  return (
    <div className="bg-lg-surface rounded-2xl border border-lg-surface-2 shadow-sm">
      <div className="p-5 border-b border-lg-surface-2 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center"><Flag className="w-4 h-4 text-red-500" /></div>
        <div><h3 className="font-bold text-lg-text">Contenido Reportado</h3><p className="text-[11px] text-lg-dim">{flagged.length} elemento{flagged.length !== 1 ? 's' : ''} con {reportsService.REPORT_THRESHOLD}+ reportes</p></div>
      </div>
      {flagged.length === 0 ? (
        <div className="text-center py-16 text-lg-dim"><CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-200" /><p className="text-sm font-medium text-lg-dim">No hay contenido reportado</p><p className="text-xs text-lg-dim mt-1">Todo está bajo control</p></div>
      ) : (
        <div className="divide-y divide-lg-surface-2 max-h-[60vh] overflow-y-auto">
          {flagged.map((item) => (
            <div key={item.targetId} className="flex items-start gap-3 px-5 py-4 hover:bg-lg-surface-2 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0"><Flag className="w-4 h-4 text-red-500" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-lg-text">{item.authorName}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.reportCount >= 5 ? 'bg-red-100 text-red-600' : 'bg-lg-surface-2 text-lg-accent'}`}>{item.reportCount} reportes</span>
                </div>
                <p className="text-xs text-lg-dim mt-0.5 line-clamp-2">{item.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-red-400 font-medium">Último: {item.latestReason}</span>
                  <span className="text-[10px] text-lg-dim">·</span>
                  <span className="text-[10px] text-lg-dim capitalize">{item.targetType === 'review' ? 'Reseña' : 'Comentario'}</span>
                </div>
              </div>
              <button onClick={() => setConfirmBanItem(item)} disabled={banning === item.authorId}
                className="p-2 rounded-xl text-lg-dim hover:text-red-500 hover:bg-red-50 transition-all shrink-0 disabled:opacity-50" title="Banear usuario">
                {banning === item.authorId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!confirmBanItem} onClose={() => setConfirmBanItem(null)}
        onConfirm={() => { if (confirmBanItem) handleBanFromContent(confirmBanItem); }}
        title="Banear usuario" message={confirmBanItem ? `¿Banear a ${confirmBanItem.authorName} por "${confirmBanItem.latestReason}"?` : ''}
        confirmLabel="Banear" variant="danger" />
    </div>
  );
}
