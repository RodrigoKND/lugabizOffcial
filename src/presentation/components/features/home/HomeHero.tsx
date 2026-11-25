import { motion } from 'framer-motion';
import HeroHeading from './HeroHeading';
import HeroSearch from './HeroSearch';
import HeroFloatCards from './HeroFloatCards';
import HomeHeroTopBar from './HomeHeroTopBar';
import FeedbackStrip from '@presentation/components/features/feedback/FeedbackStrip';

// Hero de la home: composición de piezas (titular, buscador y tarjetas flotantes).
const HomeHero: React.FC = () => (
  <motion.header
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    // overflow-x-clip (no hidden): recorta lo decorativo que sobresale a los lados pero deja salir el desplegable de resultados hacia abajo.
    // z-20: el desplegable debe quedar sobre el bento y el resto del contenido, que vienen después.
    className="relative z-20 overflow-x-clip bg-lg-ground"
  >
    <FeedbackStrip />
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-9 pb-6 sm:pb-8 grid md:grid-cols-[1.25fr_1fr] gap-8 items-center">
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
