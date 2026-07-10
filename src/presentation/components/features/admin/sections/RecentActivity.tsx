import { useState, useEffect } from 'react';
import { adminService } from '@lib/supabase/services/admin/admin';
import { Activity, Loader2, Clock } from 'lucide-react';
import { timeAgo } from '../helpers';

interface Activity {
  id?: string;
  action?: string;
  title?: string;
  body?: string;
  created_at: string;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getRecentActivity().then(setActivities).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
      <div className="p-5 border-b border-stone-50 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center"><Activity className="w-4 h-4 text-stone-500" /></div>
        <div><h3 className="text-sm font-bold text-stone-800">Actividad Reciente</h3><p className="text-[10px] text-stone-400">Últimas acciones del sistema</p></div>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-stone-400" /></div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-10">Sin actividad reciente</p>
      ) : (
        <div className="divide-y divide-stone-50 max-h-72 overflow-y-auto">
          {activities.map((a, i) => (
            <div key={a.id || i} className="flex items-start gap-3 px-5 py-3 hover:bg-stone-50 transition-colors">
              <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center shrink-0 mt-0.5"><Activity className="w-3.5 h-3.5 text-stone-400" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-stone-700 truncate">{a.action || a.title || 'Actividad'}</p>
                {a.body && <p className="text-[10px] text-stone-400 truncate">{a.body}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0"><Clock className="w-2.5 h-2.5 text-stone-300" /><span className="text-[10px] text-stone-400">{timeAgo(a.created_at)}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
