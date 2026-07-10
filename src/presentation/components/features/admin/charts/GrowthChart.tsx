import { BarChart2 } from 'lucide-react';
import { C } from '../constants';
import { smoothPath } from '../helpers';
import type { AdminGrowthDataPoint } from '@domain/entities';

export function GrowthChart({ data }: { data: AdminGrowthDataPoint[] }) {
  if (!data.length) return (
    <div className="h-48 flex flex-col items-center justify-center text-stone-300 gap-2">
      <BarChart2 className="w-8 h-8" />
      <p className="text-xs">Sin datos de crecimiento aún</p>
    </div>
  );

  const W = 460, H = 160, PT = 12, PR = 8, PB = 28, PL = 36;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxVal = Math.max(...data.flatMap(d => [d.users, d.places, d.events]), 1);
  const n = data.length;

  const points = (key: 'users' | 'places' | 'events'): [number, number][] =>
    data.map((d, i) => [
      PL + (i / Math.max(n - 1, 1)) * cW,
      PT + cH - (d[key] / maxVal) * cH,
    ]);

  const areaPath = (key: 'users' | 'places' | 'events') => {
    const pts = points(key);
    return `${smoothPath(pts)} L ${PL + cW} ${PT + cH} L ${PL} ${PT + cH} Z`;
  };

  const gridVals = [0, Math.round(maxVal / 2), maxVal];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
      {gridVals.map((v, i) => {
        const y = PT + cH - (v / maxVal) * cH;
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={PL + cW} y2={y} stroke="#f0f0f0" strokeWidth={1} />
            <text x={PL - 6} y={y + 3.5} textAnchor="end" fontSize={9} fill="#9ca3af">{v}</text>
          </g>
        );
      })}
      {(['users', 'places', 'events'] as const).map((k, idx) => (
        <path key={k} d={areaPath(k)} fill={[C.users, C.places, C.events][idx]} opacity={0.08} />
      ))}
      {(['users', 'places', 'events'] as const).map((k, idx) => (
        <path key={k} d={smoothPath(points(k))} fill="none"
          stroke={[C.users, C.places, C.events][idx]} strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {(['users', 'places', 'events'] as const).map((k, idx) =>
        points(k).map(([x, y], i) => (
          <circle key={`${k}-${i}`} cx={x} cy={y} r={3}
            fill="white" stroke={[C.users, C.places, C.events][idx]} strokeWidth={1.5} />
        ))
      )}
      {data.map((d, i) => (
        <text key={i} x={PL + (i / Math.max(n - 1, 1)) * cW} y={H - 6}
          textAnchor="middle" fontSize={9.5} fill="#9ca3af">{d.month}</text>
      ))}
    </svg>
  );
}
