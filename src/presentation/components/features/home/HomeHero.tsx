import { motion } from 'framer-motion';
import HeroHeading from './HeroHeading';
import HeroSearch from './HeroSearch';
import HeroFloatCards from './HeroFloatCards';
import HeroWave from './HeroWave';

// Hero de la home: composición de piezas (titular, buscador,
// tarjetas flotantes y onda de transición).
const HomeHero: React.FC = () => (
  <motion.header
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="relative overflow-hidden"
    style={{ background: 'linear-gradient(105deg, #faf8ff 0%, #efe6fd 55%, #e2d2fa 100%)' }}
  >
    {/* Blobs decorativos */}
    <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-primary-300/30 blur-3xl pointer-events-none" />
    <div className="absolute top-1/2 -left-20 w-64 h-64 rounded-full bg-pink-200/40 blur-3xl pointer-events-none" />

    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-9 sm:pt-12 pb-12 sm:pb-14 grid md:grid-cols-[1.25fr_1fr] gap-8 items-center">
      <div>
        <HeroHeading />
        <HeroSearch />
      </div>
      <HeroFloatCards />
    </div>

    <HeroWave />
  </motion.header>
);

export default HomeHero;
