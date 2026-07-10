import { useState, useEffect, useCallback } from 'react';
import { getModerationLogs, markModerationLogReviewed, type ModerationLog } from '@lib/supabase/services/moderation/moderationService';
import { ShieldAlert, Loader2, CheckCircle, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { timeAgo } from '../helpers';
import { CONTENT_TYPE_LABELS } from '../constants';

export function ModerationSection() {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try { setLogs(await getModerationLogs()); }
    catch { toast.error('Error al cargar logs de moderación'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleMarkReviewed = async (id: string) => {
    setReviewing(id);
    try {
      await markModerationLogReviewed(id);
      setLogs(prev => prev.map(l => l.id === id ? { ...l, reviewed: true } : l));
    } catch { toast.error('Error al marcar como revisado'); }
    finally { setReviewing(null); }
  };

  const pending = logs.filter(l => !l.reviewed);
  const reviewed = logs.filter(l => l.reviewed);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total detectados', value: logs.length, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Pendientes de revisión', value: pending.length, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Revisados', value: reviewed.length, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
        <div className="p-5 border-b border-stone-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center"><ShieldAlert className="w-4 h-4 text-red-500" /></div>
          <div className="flex-1"><h3 className="font-bold text-stone-800">Intentos de contenido inapropiado</h3><p className="text-[11px] text-stone-400">Detectados automáticamente por IA</p></div>
          <button onClick={loadLogs} className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600"><RefreshCw className="w-4 h-4" /></button>
        </div>
        {logs.length === 0 ? (
          <div className="text-center py-16 text-stone-400"><CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-200" /><p className="text-sm font-medium text-stone-500">Sin contenido inapropiado detectado</p><p className="text-xs text-stone-400 mt-1">La comunidad está siguiendo las normas</p></div>
        ) : (
          <div className="divide-y divide-stone-50 max-h-[60vh] overflow-y-auto">
            {logs.map(log => (
              <div key={log.id} className={`flex items-start gap-3 px-5 py-4 hover:bg-stone-50 transition-colors ${log.reviewed ? 'opacity-50' : ''}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${log.reviewed ? 'bg-stone-100' : 'bg-red-50'}`}>
                  <ShieldAlert className={`w-4 h-4 ${log.reviewed ? 'text-stone-400' : 'text-red-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-stone-700">{log.userName}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      log.contentType === 'place' ? 'bg-primary-100 text-primary-700' :
                      log.contentType === 'event' ? 'bg-emerald-100 text-emerald-700' :
                      log.contentType === 'post' ? 'bg-blue-100 text-blue-700' :
                      log.contentType === 'survey' ? 'bg-violet-100 text-violet-700' : 'bg-primary-100 text-primary-700'
                    }`}>{CONTENT_TYPE_LABELS[log.contentType] ?? log.contentType}</span>
                    {log.reviewed && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500">Revisado</span>}
                  </div>
                  <p className="text-xs text-stone-500 mb-1 line-clamp-2 italic">"{log.contentText}"</p>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                    <span className="text-[11px] text-red-500 font-medium">{log.reason}</span>
                    <span className="text-stone-300">·</span>
                    <Clock className="w-2.5 h-2.5 text-stone-300" />
                    <span className="text-[10px] text-stone-400">{timeAgo(log.createdAt.toISOString())}</span>
                  </div>
                </div>
                {!log.reviewed && (
                  <button onClick={() => handleMarkReviewed(log.id)} disabled={reviewing === log.id}
                    className="p-2 rounded-xl text-stone-400 hover:text-green-500 hover:bg-green-50 transition-all disabled:opacity-50 shrink-0" title="Marcar como revisado">
                    {reviewing === log.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
