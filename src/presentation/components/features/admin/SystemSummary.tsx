import React from 'react';
import { BarChart3 } from 'lucide-react';
import type { AdminStats, StatCardItem } from '@domain/entities/AdminPanelTypes';

interface SystemSummaryProps {
  stats: AdminStats | null;
  cards: StatCardItem[];
}

export const SystemSummary: React.FC<SystemSummaryProps> = ({ stats, cards }) => {
  const total = cards.reduce((a, c) => a + (stats?.[c.label.toLowerCase() as keyof AdminStats] || 0), 0) || 1;

  return (
    <div className="bg-lg-surface rounded-3xl p-6 border border-lg-surface-2 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-5 h-5 text-amber-500" />
        <h2 className="font-bold text-lg-text">Resumen del Sistema</h2>
      </div>
      <div className="space-y-3">
        {cards.map(card => {
          const val = stats?.[card.label.toLowerCase() as keyof AdminStats] || 0;
          const pct = Math.round((val / total) * 100);
          return (
            <div key={card.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-lg-dim">{card.label}</span>
                <span className="font-semibold text-lg-text">{val}</span>
              </div>
              <div className="w-full bg-lg-surface-2 rounded-full h-1.5">
                <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
