// Onda que conecta el hero con el fondo claro del feed.
const HeroWave: React.FC = () => (
  <svg
    viewBox="0 0 400 100"
    preserveAspectRatio="none"
    aria-hidden="true"
    className="absolute inset-x-0 bottom-0 z-10 w-full h-10 sm:h-14 -mb-px"
  >
    <path d="M0,42 C140,82 260,12 400,48 L400,100 L0,100 Z" fill="#f7f5fb" />
  </svg>
);

export default HeroWave;
