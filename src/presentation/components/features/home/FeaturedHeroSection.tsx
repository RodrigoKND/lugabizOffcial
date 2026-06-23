import { motion } from 'framer-motion';
import { FeaturedHeroSectionProps } from '@domain/entities/HomeTypes';
import HeroBanner from './HeroBanner';

const FeaturedHeroSection: React.FC<FeaturedHeroSectionProps> = ({
  heroEvent, activeEvents, heroIndex, onSetHeroIndex, onEventClick
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="mb-8">
    <div className="flex items-center gap-2 mb-3 px-1">
      {activeEvents.length > 1 && (
        <div className="flex gap-1">
          {activeEvents.slice(0, Math.min(activeEvents.length, 5)).map((_, i) => (
            <button key={i} onClick={() => onSetHeroIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === heroIndex ? 'w-6 bg-pink-500' : 'w-1.5 bg-stone-300 hover:bg-stone-400'
              }`}
            />
          ))}
        </div>
      )}
      <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
      <h2 className="font-semibold text-[15px] text-white">Destacado</h2>
    </div>
    <HeroBanner
      image={heroEvent.image}
      name={heroEvent.name}
      description={heroEvent.description}
      category={heroEvent.category?.name}
      date={new Date(heroEvent.dateStart).toLocaleDateString('es', { day: 'numeric', month: 'long' })}
      time={heroEvent.timeStart}
      address={heroEvent.address}
      onClick={() => onEventClick(heroEvent.id)}
    />
  </motion.div>
);

export default FeaturedHeroSection;
