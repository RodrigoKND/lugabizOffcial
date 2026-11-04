import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { StoriesRowProps } from '@domain/entities/HomeTypes';
import { TikTokBadge } from '@presentation/components/reusables';
import { extractTikTokVideoId } from '@infrastructure/utils/socialLinks';

const StoriesRow: React.FC<StoriesRowProps> = ({ events, onEventClick, viewedEvents, likedEvents }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1 }}
    className="mb-6"
  >
    {/* pt-3: overflow-x-auto por sí solo también recorta el eje vertical (regla CSS de overflow
        computado), así que sin este padding arriba el corazón que sobresale del círculo se corta */}
    <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pt-3 pb-2">
      {events?.map((event, i) => {
        const isViewed = viewedEvents?.has(event.id);
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * i }}
            className="shrink-0"
          >
            <button
              onClick={() => onEventClick(event.id)}
              className={`flex flex-col items-center gap-1.5 shrink-0 active:scale-95 transition-all ${isViewed ? 'opacity-50' : ''}`}
            >
              {/* Anillo + imagen (contenedor perfectamente circular) */}
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-[3px] rounded-full"
              >
                {/* Anillo: lila con brillo si no visto, apagado si ya visto */}
                {isViewed ? (
                  <div className="absolute inset-0 rounded-full bg-lg-surface-2" />
                ) : (
                  <>
                    <div className="absolute inset-0 rounded-full bg-lg-accent" />
                    {/* Brillo deslizante */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.45) 30deg, transparent 60deg)' }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </>
                )}
                {/* Corazón: aparece solo si el usuario le dio me encanta a este evento */}
                {likedEvents?.has(event.id) && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 480, damping: 16, delay: 0.15 * i }}
                    className="absolute -top-1 -right-1 z-20 w-6 h-6 rounded-full bg-lg-text shadow-md ring-2 ring-lg-ground flex items-center justify-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.28, 1, 1.15, 1] }}
                      transition={{
                        duration: 1.6, times: [0, 0.18, 0.36, 0.54, 1],
                        repeat: Infinity, repeatDelay: 0.9, ease: 'easeInOut',
                        delay: 0.6 + 0.15 * i,
                      }}
                    >
                      <Heart className="w-3 h-3 fill-lg-ink text-lg-ink" />
                    </motion.div>
                  </motion.div>
                )}
                {/* Avatar circular */}
                <div className="relative rounded-full bg-lg-ground p-[2px]">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.name}
                      className={`w-16 h-16 rounded-full object-cover block ${isViewed ? 'grayscale-[40%]' : ''}`}
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold ${isViewed ? 'bg-lg-surface text-lg-dim' : 'bg-lg-surface-2 text-lg-accent'}`}>
                      {event.name.charAt(0)}
                    </div>
                  )}
                  {extractTikTokVideoId(event.socialLinks?.tiktok) && (
                    <TikTokBadge className="absolute bottom-0 right-0 w-5 h-5 ring-2 ring-lg-ground" />
                  )}
                </div>
              </motion.div>

              {/* Nombre — fuera del anillo para no deformar el círculo */}
              <span className={`text-[11px] font-medium w-16 truncate text-center leading-tight ${isViewed ? 'text-lg-dim/60' : 'text-lg-dim'}`}>
                {event.name}
              </span>
            </button>
          </motion.div>
        );
      })}
    </div>
  </motion.div>
);

export default StoriesRow;
