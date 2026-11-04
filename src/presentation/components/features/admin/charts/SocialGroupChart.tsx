import { motion } from 'framer-motion';
import { C } from '../constants';

export function SocialGroupChart({ items, maxColor }: {
  items: Array<{ name: string; value: number; color?: string; sub?: number }>;
  maxColor?: string;
}) {
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-lg-dim truncate max-w-[140px]">{item.name}</span>
            <span className="text-xs font-bold text-lg-text ml-2 tabular-nums">{item.value}</span>
          </div>
          <div className="w-full bg-lg-surface-2 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
              className="h-2 rounded-full"
              style={{ backgroundColor: item.color || maxColor || C.places }}
            />
          </div>
          {item.sub !== undefined && (
            <div className="flex gap-3 mt-1">
              <span className="text-[9px] text-lg-dim">Lugares: {item.sub}</span>
              <span className="text-[9px] text-lg-dim">Eventos: {item.value - (item.sub || 0)}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
