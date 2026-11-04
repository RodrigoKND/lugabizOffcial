import React from 'react';
import { StatCardProps } from '@domain/entities/ProfileTypes';

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color = 'text-lg-accent' }) => (
  <div className="bg-lg-surface rounded-xl p-4 border border-lg-surface-2 shadow-xs">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg bg-lg-surface-2">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <span className="text-xs font-semibold text-lg-dim uppercase">{label}</span>
    </div>
    <p className="text-2xl font-bold text-lg-text">{value}</p>
  </div>
);

export default StatCard;
