import { useBillboards } from '@presentation/hooks/home/useBillboards';
import BillboardScreen from './BillboardScreen';
import type { BillboardEvent, BillboardPlace, PlaceTotals } from './billboards';

interface CarteleraProps {
  events: BillboardEvent[];
  places: BillboardPlace[];
  totals?: PlaceTotals;
}

// Cartelera de Cochabamba: pantallas grandes que se recorren con el dedo. Sin datos, no se pinta.
export default function Cartelera({ events, places, totals }: CarteleraProps) {
  const billboards = useBillboards(events, places, totals);

  if (!billboards.length) return null;

  return (
    <section aria-labelledby="cartelera-title" className="mb-6">
      <h2 id="cartelera-title" className="px-1 font-flyer-sm text-2xl text-lg-text sm:text-3xl">En cartelera</h2>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3 pt-4">
        {billboards.map(b => <BillboardScreen key={b.id} billboard={b} />)}
      </div>
    </section>
  );
}
