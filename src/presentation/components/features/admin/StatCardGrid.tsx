import React from 'react';
import type { StatCardItem } from '@domain/entities/AdminPanelTypes';
import { AdminStatCard } from './AdminStatCard';

interface StatCardGridProps {
  cards: StatCardItem[];
}

export const StatCardGrid: React.FC<StatCardGridProps> = ({ cards }) => (
  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
    {cards.map((card, i) => (
      <AdminStatCard key={card.label} card={card} index={i} />
    ))}
  </div>
);
