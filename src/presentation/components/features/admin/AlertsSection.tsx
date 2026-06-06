import React from 'react';
import { AlertTriangle, CheckCircle, Activity, TrendingUp } from 'lucide-react';
import type { AdminStats, StatCardItem } from '@domain/entities/AdminPanelTypes';

interface AlertsSectionProps {
  stats: AdminStats | null;
  cards: StatCardItem[];
}

export const AlertsSection: React.FC<AlertsSectionProps> = ({ stats, cards }) => {
  const total = cards.reduce((a, c) => a + (stats?.[c.label.toLowerCase() as keyof AdminStats] || 0), 0);

  return (
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
            <p className="text-xs text-amber-600">Total: {total} registros</p>
          </div>
        </div>
      </div>
    </div>
  );
};
