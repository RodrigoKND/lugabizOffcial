import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

function StarBar({ star, count, max }: { star: number; count: number; max: number }) {
  const pct = max > 0 ? Math.round(count / max * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-[12px] text-stone-500 w-4 text-right shrink-0">{star}</span>
      <Star className="w-3 h-3 text-amber-400 shrink-0" />
      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
        />
      </div>
      <span className="text-[11px] text-stone-400 w-5 shrink-0">{count}</span>
    </div>
  );
}

export default StarBar;
