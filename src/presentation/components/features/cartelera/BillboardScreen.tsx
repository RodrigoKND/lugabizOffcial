import { Link } from 'react-router-dom';
import { posterTheme, headlineSize } from '@presentation/components/features/cartel/posterTheme';
import type { Billboard } from './billboards';

interface BillboardScreenProps {
  billboard: Billboard;
}

// Pantalla grande de la cartelera: enlace real al lugar o evento, con el mismo lenguaje de cartel de la Fase 1.
export default function BillboardScreen({ billboard: b }: BillboardScreenProps) {
  const theme = posterTheme(b.category);

  return (
    <Link to={b.to} className="group relative block shrink-0 snap-start w-[82%] sm:w-80 aspect-[16/11] overflow-hidden rounded-xl border-2 border-lg-text bg-lg-surface poster-shadow">
      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundImage: `url(${b.image || ''})` }} />
      <div className="absolute inset-0 poster-halftone" aria-hidden="true" />

      <span className="absolute left-2 top-2 z-10 bg-lg-text px-2.5 py-1 text-xs text-lg-ink sticker-tag">{b.kicker}</span>

      <div className={`absolute inset-x-0 bottom-0 z-10 border-t-2 border-lg-text px-3 py-2 ${theme.bg} ${theme.ink}`}>
        <p className={`font-flyer ${headlineSize(b.name, true)} line-clamp-2`}>{b.name}</p>
        <p className="mt-0.5 text-xs font-bold">{b.detail}</p>
      </div>
    </Link>
  );
}
