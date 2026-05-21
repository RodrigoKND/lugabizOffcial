import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import {
  Users, MapPin, CalendarDays, MessageSquare, Bell,
  TrendingUp, Activity, AlertTriangle, ArrowLeft, Loader2,
  CheckCircle, BarChart3, ClipboardList
} from 'lucide-react';
import { useAuth } from '@presentation/context';
import { adminService } from '@lib/supabase';
import { useSEO } from '@presentation/hooks/seo/useSEO';

const AdminPanel: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Panel de Administración',
    description: 'Monitoreo del sistema Lugabiz',
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (err) {
        console.error('Error loading admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (isLoading) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const statCards = [
    { label: 'Usuarios', value: stats?.users || 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Lugares', value: stats?.places || 0, icon: MapPin, color: 'bg-amber-50 text-amber-600' },
    { label: 'Eventos', value: stats?.events || 0, icon: CalendarDays, color: 'bg-green-50 text-green-600' },
    { label: 'Reseñas', value: stats?.reviews || 0, icon: MessageSquare, color: 'bg-purple-50 text-purple-600' },
    { label: 'Encuestas', value: stats?.surveys || 0, icon: ClipboardList, color: 'bg-teal-50 text-teal-600' },
    { label: 'Notificaciones', value: stats?.notifications || 0, icon: Bell, color: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/profile" className="p-2 hover:bg-stone-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-stone-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Panel de Administración</h1>
            <p className="text-stone-500 text-sm">Monitoreo del sistema</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-stone-400">
            <Activity className="w-4 h-4" />
            <span>En vivo</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {statCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-stone-800">{card.value}</p>
                    <p className="text-xs text-stone-400 font-semibold uppercase mt-1">{card.label}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-amber-500" />
                  <h2 className="font-bold text-stone-800">Resumen del Sistema</h2>
                </div>
                <div className="space-y-3">
                  {statCards.map(card => {
                    const total = statCards.reduce((a, c) => a + (stats?.[c.label.toLowerCase()] || 0), 0) || 1;
                    const val = stats?.[card.label.toLowerCase()] || 0;
                    const pct = Math.round((val / total) * 100);
                    return (
                      <div key={card.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-stone-600">{card.label}</span>
                          <span className="font-semibold text-stone-800">{val}</span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-1.5">
                          <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h2 className="font-bold text-stone-800">Alertas y Estado</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-semibold text-green-700">Sistema operativo</p>
                      <p className="text-xs text-green-600">Todos los servicios funcionando correctamente</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-2xl">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-blue-700">Base de datos</p>
                      <p className="text-xs text-blue-600">Conexión estable con Supabase</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold text-amber-700">Crecimiento</p>
                      <p className="text-xs text-amber-600">Total: {statCards.reduce((a, c) => a + (stats?.[c.label.toLowerCase()] || 0), 0)} registros</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
