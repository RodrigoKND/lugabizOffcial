import { useNavigate } from 'react-router-dom';
import { SearchX } from 'lucide-react';

export default function EventDetailNotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-lg-ground px-6 text-center">
      <SearchX className="h-12 w-12 text-lg-accent" aria-hidden="true" />
      <h1 className="font-flyer-sm text-3xl text-lg-text">Evento no encontrado</h1>
      <p className="max-w-xs text-sm text-lg-dim">Puede que ya no exista o que el enlace esté mal.</p>
      <button onClick={() => navigate('/')} className="h-12 rounded-lg bg-lg-accent px-6 font-bold text-lg-ink transition-transform active:scale-95">
        Volver al inicio
      </button>
    </div>
  );
}
