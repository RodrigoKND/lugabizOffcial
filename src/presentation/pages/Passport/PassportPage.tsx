import { useMemo } from 'react';
import { useAuth, usePlaces } from '@presentation/context';
import { usePassport } from '@presentation/hooks/home/usePassport';
import { pendingStampPlaces } from '@presentation/hooks/home/pendingStampPlaces';
import { useSEO } from '@presentation/hooks/seo/useSEO';
import PassportHero from '@presentation/components/features/passport/PassportHero';
import StampGrid from '@presentation/components/features/passport/StampGrid';
import PendingPlaces from '@presentation/components/features/passport/PendingPlaces';

// Pasaporte cochabambino: sellos ganados, nivel y lugares por sellar.
const PassportPage: React.FC = () => {
  const { user } = useAuth();
  const { places } = usePlaces();
  const { stamps, level } = usePassport(user?.id);
  useSEO({ title: 'Tu pasaporte cochabambino', description: 'Colecciona sellos de los lugares que visitas en Cochabamba.' });

  const pending = useMemo(
    () => pendingStampPlaces(places, new Set(stamps.map(s => s.placeId))),
    [places, stamps],
  );

  return (
    <section className="min-h-screen bg-lg-ground pb-28 md:pb-12">
      <PassportHero count={stamps.length} level={level} />
      {user
        ? <StampGrid stamps={stamps} />
        : <p className="px-4 sm:px-6 max-w-3xl mx-auto pb-8 text-lg-dim">Inicia sesión para empezar a coleccionar sellos.</p>}
      <PendingPlaces places={pending} />
    </section>
  );
};

export default PassportPage;
