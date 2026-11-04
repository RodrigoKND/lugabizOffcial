import { Sparkles, PartyPopper, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlaces } from '@presentation/context';

// Columna derecha del hero (desktop): tarjetas flotantes con datos reales.
const HeroFloatCards: React.FC = () => {
  const { places, events } = usePlaces();
  const upcomingEvents = events.filter(e => new Date(e.dateStart) >= new Date()).length;

  const chips = [
    { icon: Sparkles, tile: 'bg-lg-accent text-lg-ink', big: `${places.length}`, small: 'lugares para descubrir', pos: 'top-2 left-4', delay: '0s' },
    { icon: PartyPopper, tile: 'bg-lg-text text-lg-ink', big: `${upcomingEvents}`, small: 'eventos para ti', pos: 'top-20 right-2', delay: '0.8s' },
    { icon: Bot, tile: 'bg-lg-surface-2 text-lg-accent', big: 'Lubi', small: 'tu asistente IA 24/7', pos: 'bottom-4 left-10', delay: '1.6s' },
  ];

  return (
    <div className="relative hidden md:block h-64">
      {chips.map((chip) => (
        <motion.div
          key={chip.small}
          initial={{ opacity: 0, scale: 0.85, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className={`absolute ${chip.pos} animate-float`}
          style={{ animationDelay: chip.delay }}
        >
          <div className="flex items-center gap-3 bg-lg-surface rounded-2xl px-4 py-3 shadow-xl shadow-black/30">
            <span className={`w-10 h-10 rounded-xl ${chip.tile} flex items-center justify-center`}>
              <chip.icon className="w-5 h-5" />
            </span>
            <span className="leading-tight">
              <span className="block font-flyer-sm text-xl text-lg-text">{chip.big}</span>
              <span className="block text-[11px] text-lg-dim font-medium">{chip.small}</span>
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default HeroFloatCards;
