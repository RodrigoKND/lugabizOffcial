import { useMemo } from 'react';
import {
  buildBillboards, type BillboardEvent, type BillboardPlace, type PlaceTotals,
} from '@presentation/components/features/cartelera/billboards';

// Cartelera lista para pintar a partir de lo que la Home ya cargó (no hace peticiones).
export function useBillboards(events: BillboardEvent[], places: BillboardPlace[], totals?: PlaceTotals) {
  return useMemo(() => buildBillboards(events, places, new Date(), totals), [events, places, totals]);
}
