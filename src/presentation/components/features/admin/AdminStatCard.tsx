import React from 'react';
import { motion } from 'framer-motion';
import type { StatCardItem } from '@domain/entities/AdminPanelTypes';

interface AdminStatCardProps {
  card: StatCardItem;
  index: number;
}

export const AdminStatCard: React.FC<AdminStatCardProps> = ({ card, index }) => {
  const Icon = card.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-stone-800">{card.value}</p>
      <p className="text-xs text-stone-400 font-semibold uppercase mt-1">{card.label}</p>
    </motion.div>
  );
};
