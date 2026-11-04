import { MapPin, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHomeWeather } from '@presentation/hooks/home/useHomeWeather';
import { useStoredCoords } from '@presentation/hooks/home/useStoredCoords';

// Titular del hero + chip de ubicación y clima.
const HeroHeading: React.FC = () => {
  const { lat, lng } = useStoredCoords();
  const tempC = useHomeWeather(lat, lng);

  return (
  <div>
    <motion.h1
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="font-flyer text-lg-text"
      style={{ fontSize: 'clamp(3rem, 15vw, 5.5rem)' }}
    >
      ¿Qué planes
      <br />
      <span className="text-lg-accent">tenemos hoy?</span>
    </motion.h1>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="mt-4 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-lg-surface"
    >
      <span className="flex items-center gap-1 text-xs font-semibold text-lg-text">
        <MapPin className="w-3.5 h-3.5 text-lg-accent" />
        Cochabamba, Bolivia
      </span>
      <span className="w-px h-3.5 bg-lg-surface-2" />
      <span className="flex items-center gap-1 text-xs font-bold text-lg-accent">
        <Sun className="w-3.5 h-3.5" />
        {tempC !== null ? `${tempC}°C` : '—'}
      </span>
    </motion.div>
  </div>
  );
};

export default HeroHeading;
