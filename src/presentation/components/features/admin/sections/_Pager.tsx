import { ChevronLeft, ChevronRight } from 'lucide-react';
import { pageWindow } from '../pagination';

interface PagerProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
}

const BTN = 'min-w-8 h-8 px-2 rounded-lg text-xs font-bold flex items-center justify-center transition-colors';

// Paginador del admin: va ARRIBA de la lista, junto al buscador.
export function Pager({ page, totalPages, total, pageSize, onPage }: PagerProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-xs text-lg-dim font-medium">Mostrando {from}–{to} de {total}</span>
      {totalPages > 1 && (
        <nav className="flex items-center gap-1" aria-label="Paginación">
          <button onClick={() => onPage(page - 1)} disabled={page === 1} aria-label="Página anterior"
            className={`${BTN} bg-lg-surface-2 text-lg-text disabled:opacity-40`}><ChevronLeft className="w-4 h-4" /></button>
          {pageWindow(page, totalPages).map((n, i) => n === '…'
            ? <span key={`gap-${i}`} className="px-1 text-lg-dim">…</span>
            : <button key={n} onClick={() => onPage(n)} aria-current={n === page ? 'page' : undefined}
                className={`${BTN} ${n === page ? 'bg-lg-accent text-lg-ink' : 'bg-lg-surface-2 text-lg-text hover:bg-lg-accent/30'}`}>{n}</button>)}
          <button onClick={() => onPage(page + 1)} disabled={page === totalPages} aria-label="Página siguiente"
            className={`${BTN} bg-lg-surface-2 text-lg-text disabled:opacity-40`}><ChevronRight className="w-4 h-4" /></button>
        </nav>
      )}
    </div>
  );
}
