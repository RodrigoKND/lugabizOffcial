import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

interface PlaceLoginGateProps {
  onHome: () => void;
}

// Sin sesión y sin lugar a la vista: invita a entrar con un solo botón grande.
export default function PlaceLoginGate({ onHome }: PlaceLoginGateProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-lg-ground px-4">
      <div className="w-full max-w-sm rounded-xl border-2 border-lg-text bg-lg-surface p-6 text-center poster-shadow">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-lg-surface-2 text-lg-accent">
          <LogIn className="h-7 w-7" />
        </span>
        <h1 className="mb-2 font-flyer-sm text-3xl text-lg-text">Inicia sesión</h1>
        <p className="mb-6 text-sm leading-relaxed text-lg-dim">Necesitas iniciar sesión para ver los detalles de este lugar.</p>
        <Link to="/?auth=login" className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-lg-accent font-bold text-lg-ink transition-transform active:scale-95">
          <LogIn className="h-4 w-4" /> Iniciar sesión
        </Link>
        <button onClick={onHome} className="mt-2 h-11 w-full text-sm font-semibold text-lg-dim hover:text-lg-text">Volver al inicio</button>
      </div>
    </div>
  );
}
