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
      className="font-bold text-[#241b3e] leading-[1.02] tracking-tight"
      style={{ fontSize: 'clamp(2.1rem, 9vw, 3.4rem)' }}
    >
      ¿Qué planes
      <br />
      tenemos hoy?
    </motion.h1>

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="mt-4 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white shadow-sm ring-1 ring-primary-100"
    >
      <span className="flex items-center gap-1 text-xs font-medium text-stone-600">
        <MapPin className="w-3.5 h-3.5 text-primary-500" />
        Cochabamba, Bolivia
      </span>
      <span className="w-px h-3.5 bg-stone-200" />
      <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
        <Sun className="w-3.5 h-3.5" />
        {tempC !== null ? `${tempC}°C` : '—'}
      </span>
    </motion.div>
  </div>
  );
};

export default HeroHeading;
