import React from 'react';
import { StatCardProps } from '@domain/entities/ProfileTypes';

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color = 'text-primary-500' }) => (
  <div className="bg-white rounded-xl p-4 border border-primary-100/40 shadow-xs">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg bg-primary-50">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <span className="text-xs font-semibold text-stone-500 uppercase">{label}</span>
    </div>
    <p className="text-2xl font-bold text-[#241b3e]">{value}</p>
  </div>
);

export default StatCard;
