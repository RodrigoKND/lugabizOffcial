import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import AppealHiddenPlaceModal from './AppealHiddenPlaceModal';

interface HiddenPlaceBannerProps {
  placeId: string;
  isOwner: boolean;
}

// Solo lo ve el dueño o un admin (la RLS ya oculta el lugar para todos los
// demás, así que si esto se está renderizando es porque el viewer tiene
// permiso para verlo pese a estar oculto).
const HiddenPlaceBanner: React.FC<HiddenPlaceBannerProps> = ({ placeId, isOwner }) => {
  const [showAppeal, setShowAppeal] = useState(false);

  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-red-300">
          {isOwner ? 'Este lugar fue ocultado por reportes de la comunidad' : 'Lugar oculto (solo vos, como admin, lo ves)'}
        </p>
        <p className="text-xs text-red-300/70 mt-0.5">
          Nadie más lo puede ver mientras esté en este estado.
          {isOwner && ' Si creés que fue un error, podés apelar y un admin lo va a revisar.'}
        </p>
        {isOwner && (
          <button onClick={() => setShowAppeal(true)}
            className="mt-2 px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 rounded-lg text-xs font-semibold transition-colors">
            Apelar
          </button>
        )}
      </div>
      <AppealHiddenPlaceModal isOpen={showAppeal} onClose={() => setShowAppeal(false)} placeId={placeId} />
    </div>
  );
};

export default HiddenPlaceBanner;
