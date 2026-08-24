import { Sparkles, PartyPopper, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlaces } from '@presentation/context';

// Columna derecha del hero (desktop): tarjetas flotantes con datos reales.
const HeroFloatCards: React.FC = () => {
  const { places, events } = usePlaces();
  const upcomingEvents = events.filter(e => new Date(e.dateStart) >= new Date()).length;

  const chips = [
    { icon: Sparkles, tile: 'from-primary-500 to-primary-700', big: `${places.length}`, small: 'lugares para descubrir', pos: 'top-2 left-4', delay: '0s' },
    { icon: PartyPopper, tile: 'from-pink-500 to-rose-500', big: `${upcomingEvents}`, small: 'eventos para ti', pos: 'top-20 right-2', delay: '0.8s' },
    { icon: Bot, tile: 'from-violet-500 to-purple-700', big: 'Lubi', small: 'tu asistente IA 24/7', pos: 'bottom-4 left-10', delay: '1.6s' },
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
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-2xl px-4 py-3 shadow-[0_8px_30px_rgba(80,50,140,0.14)] ring-1 ring-white">
            <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${chip.tile} flex items-center justify-center shadow-md`}>
              <chip.icon className="w-5 h-5 text-white" />
            </span>
            <span className="leading-tight">
              <span className="block font-bold text-[#241b3e]">{chip.big}</span>
              <span className="block text-[11px] text-stone-500 font-medium">{chip.small}</span>
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default HeroFloatCards;
