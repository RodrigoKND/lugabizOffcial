import { Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PASSPORT_GOAL, type PassportLevel } from '@lib/supabase/services/chispa/passportLevel';

interface PassportHeroProps {
  count: number;
  level: PassportLevel;
}

// Cabecera de la página: nivel, progreso y botón de compartir.
const PassportHero: React.FC<PassportHeroProps> = ({ count, level }) => {
  const share = async () => {
    const text = `Llevo ${count} sellos en mi pasaporte cochabambino de Lugabiz (${level.name}). ¿Cuántos tienes tú?`;
    const url = window.location.origin;
    try {
      if (navigator.share) await navigator.share({ title: 'Mi pasaporte cochabambino', text, url });
      else { await navigator.clipboard.writeText(`${text} ${url}`); toast.success('Copiado, pégalo donde quieras'); }
    } catch { /* el usuario canceló */ }
  };

  return (
    <header className="px-4 sm:px-6 pt-8 pb-6 max-w-3xl mx-auto">
      <h1 className="font-flyer text-lg-text" style={{ fontSize: 'clamp(2.6rem, 13vw, 4.5rem)' }}>
        Tu pasaporte <span className="text-lg-accent">cochabambino</span>
      </h1>
      <p className="mt-4 text-lg-dim font-semibold">
        {count} de {PASSPORT_GOAL} sellos · nivel <span className="text-lg-text">{level.name}</span>
      </p>
      <div className="mt-3 h-3 rounded-full bg-lg-surface-2 overflow-hidden">
        <div className="h-full rounded-full bg-lg-accent transition-all" style={{ width: `${Math.round(level.progress * 100)}%` }} />
      </div>
      <p className="mt-2 text-sm text-lg-dim">
        {level.next === null ? 'Llegaste al nivel máximo. Eres de pura cepa.' : `Te faltan ${level.remaining} para el siguiente nivel.`}
      </p>
      <button onClick={share} className="mt-5 inline-flex items-center gap-2 rounded-full bg-lg-accent px-5 py-2.5 text-sm font-extrabold text-lg-ink hover:brightness-110 transition">
        <Share2 className="w-4 h-4" /> Compartir mi pasaporte
      </button>
    </header>
  );
};

export default PassportHero;
