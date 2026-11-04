import { motion } from 'framer-motion';
import HeroHeading from './HeroHeading';
import HeroSearch from './HeroSearch';
import HeroFloatCards from './HeroFloatCards';
import HomeHeroTopBar from './HomeHeroTopBar';

// Hero de la home: composición de piezas (titular, buscador y tarjetas flotantes).
const HomeHero: React.FC = () => (
  <motion.header
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="relative overflow-hidden bg-lg-ground"
  >
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-9 sm:pt-12 pb-6 sm:pb-8 grid md:grid-cols-[1.25fr_1fr] gap-8 items-center">
      <div>
        <HomeHeroTopBar />
        <HeroHeading />
        <HeroSearch />
      </div>
      <HeroFloatCards />
    </div>
  </motion.header>
);

export default HomeHero;
