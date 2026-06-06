import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, Calendar, Bell, ExternalLink, Activity, Shield, Database, TrendingUp, Loader2, BarChart2 } from 'lucide-react';
import { AppNotification } from '@domain/entities';
import { adminService } from '@lib/supabase';

interface AdminTabProps {
  myPlacesCount: number;
  myEventsCount: number;
  unreadCount: number;
  notifications: AppNotification[];
}

const AdminTab: React.FC<AdminTabProps> = ({ myPlacesCount, myEventsCount, unreadCount, notifications }) => {
  const [stats, setStats] = useState<{ users: number; places: number; events: number; reviews: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(s => setStats({ users: s.users, places: s.places, events: s.events, reviews: s.reviews }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      {/* Header + link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <h3 className="font-bold text-sm text-text-primary">Monitor del Sistema</h3>
        </div>
        <Link to="/admin"
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm">
          Panel completo <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Global stats */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { icon: Users, label: 'Usuarios', value: stats?.users ?? '—', color: 'text-blue-500', bg: 'bg-blue-50' },
            { icon: MapPin, label: 'Lugares', value: stats?.places ?? myPlacesCount, color: 'text-amber-500', bg: 'bg-amber-50' },
            { icon: Calendar, label: 'Eventos', value: stats?.events ?? myEventsCount, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { icon: Bell, label: 'Notif.', value: unreadCount, color: 'text-rose-500', bg: 'bg-rose-50' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-xl p-3.5 border border-primary-100/40 shadow-xs">
              <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <p className="text-xl font-bold text-text-primary">{typeof value === 'number' ? value.toLocaleString() : value}</p>
              <p className="text-[10px] text-text-secondary uppercase font-semibold mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status indicators */}
      <div className="bg-white rounded-xl p-4 border border-primary-100/40">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-3.5 h-3.5 text-primary-500" />
          <h4 className="font-bold text-xs text-text-primary uppercase tracking-wide">Estado de Servicios</h4>
        </div>
        <div className="space-y-2">
          {[
            { icon: Database, label: 'Base de datos', status: 'ok' },
            { icon: Shield, label: 'Autenticación', status: 'ok' },
            { icon: TrendingUp, label: 'Sistema', status: 'ok' },
          ].map(({ icon: Icon, label, status }) => (
            <div key={label} className="flex items-center gap-2.5">
              <Icon className="w-3.5 h-3.5 text-text-secondary" />
              <span className="text-xs text-text-secondary flex-1">{label}</span>
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${status === 'ok' ? 'bg-green-500' : 'bg-red-400'}`} />
                <span className={`text-[10px] font-semibold ${status === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
                  {status === 'ok' ? 'OK' : 'Error'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent notifications / activity */}
      <div className="bg-white rounded-xl p-4 border border-primary-100/40">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-3.5 h-3.5 text-primary-500" />
          <h4 className="font-semibold text-xs text-text-primary uppercase tracking-wide">Actividad Reciente</h4>
        </div>
        {notifications.length === 0 ? (
          <p className="text-xs text-text-secondary text-center py-4">Sin actividad reciente</p>
        ) : (
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {notifications.slice(0, 12).map(n => (
              <div key={n.id}
                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-primary-50 transition-colors">
                <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-2.5 h-2.5 text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{n.title}</p>
                  <p className="text-[10px] text-text-secondary truncate">{n.body}</p>
                  <p className="text-[10px] text-text-secondary/60 mt-0.5">
                    {n.createdAt.toLocaleString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTab;
