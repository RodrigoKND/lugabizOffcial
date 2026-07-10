import { Hash } from 'lucide-react';
import { PIE_COLORS } from '../constants';

export function CategoryChart({ data }: { data: Array<{ name: string; value: number }> }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return (
    <div className="w-32 h-32 flex items-center justify-center text-stone-300">
      <Hash className="w-8 h-8" />
    </div>
  );

  const r = 42, cx = 56, cy = 56;
  const circ = 2 * Math.PI * r;
  let cumPct = 0;

  return (
    <svg viewBox="0 0 112 112" className="w-32 h-32">
      {data.map((d, i) => {
        const pct = d.value / total;
        const dash = pct * circ - 1.5;
        const offset = -(cumPct * circ);
        cumPct += pct;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={16}
            strokeDasharray={`${dash} ${circ}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`} />
        );
      })}
      <circle cx={cx} cy={cy} r={28} fill="white" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={11} fontWeight="700" fill="#1c1917">
        {total.toLocaleString()}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={8} fill="#9ca3af">total</text>
    </svg>
  );
}
