import { Zap, BarChart2, Users2 } from 'lucide-react';
import { C } from '../constants';
import { SocialGroupChart } from '../charts/SocialGroupChart';

interface ChartBarItem {
  name: string;
  value: number;
  color?: string;
  sub?: number;
}

export function DashboardCategoryBlock({ catBars, sgBars }: { catBars: ChartBarItem[]; sgBars: ChartBarItem[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center"><Zap className="w-4 h-4 text-primary-500" /></div>
          <div><h3 className="text-sm font-bold text-stone-800">Categorías más Demandadas</h3><p className="text-[10px] text-stone-400">Lugares + eventos por categoría</p></div>
        </div>
        {catBars.length > 0 ? <SocialGroupChart items={catBars} maxColor={C.places} /> : (
          <div className="py-10 text-center"><BarChart2 className="w-8 h-8 text-stone-200 mx-auto mb-2" /><p className="text-xs text-stone-400">Sin datos de categorías</p></div>
        )}
      </div>
      <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center"><Users2 className="w-4 h-4 text-purple-500" /></div>
          <div><h3 className="text-sm font-bold text-stone-800">Grupos Familiares Populares</h3><p className="text-[10px] text-stone-400">Más publicados en lugares</p></div>
        </div>
        {sgBars.length > 0 ? <SocialGroupChart items={sgBars} /> : (
          <div className="py-10 text-center"><Users2 className="w-8 h-8 text-stone-200 mx-auto mb-2" /><p className="text-xs text-stone-400">Sin datos de grupos familiares</p></div>
        )}
      </div>
    </div>
  );
}
