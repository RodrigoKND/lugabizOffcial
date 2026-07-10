import React from 'react';

const Row = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="flex items-start gap-3 py-2.5 border-b border-stone-100 last:border-0">
    <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{label}</p>
      <div className="text-sm font-medium text-stone-700 mt-0.5">{value}</div>
    </div>
  </div>
);

export default Row;
