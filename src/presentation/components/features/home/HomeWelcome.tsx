import { Search, Utensils, Wine, Palette, Leaf, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { label: 'Comida',     icon: Utensils, color: 'text-orange-400 bg-orange-400/10 border-orange-400/15 hover:bg-orange-400/20 hover:border-orange-400/25' },
  { label: 'Bebidas',    icon: Wine,     color: 'text-amber-400  bg-amber-400/10  border-amber-400/15  hover:bg-amber-400/20  hover:border-amber-400/25'  },
  { label: 'Arte',       icon: Palette,  color: 'text-violet-400 bg-violet-400/10 border-violet-400/15 hover:bg-violet-400/20 hover:border-violet-400/25' },
  { label: 'Naturaleza', icon: Leaf,     color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/15 hover:bg-emerald-400/20 hover:border-emerald-400/25' },
  { label: 'Música',     icon: Music,    color: 'text-pink-400   bg-pink-400/10   border-pink-400/15   hover:bg-pink-400/20   hover:border-pink-400/25'   },
];

interface HomeWelcomeProps {
  userName?: string;
}

const HomeWelcome: React.FC<HomeWelcomeProps> = ({ userName }) => {
  const navigate = useNavigate();

  const openSearch = () => {
    document.dispatchEvent(new CustomEvent('lugabiz:open-search'));
  };

  return (
    <div className="relative pt-3 pb-10 px-1 overflow-hidden">

      {/* Glow ambiental detrás del título */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-40px', left: '-20px',
          width: '340px', height: '200px',
          background: 'radial-gradient(ellipse at 30% 40%, rgba(147,51,234,0.12), transparent 70%)',
          filter: 'blur(2px)',
        }}
      />

      {/* Saludo personalizado */}
      {userName && (
        <p className="text-white/35 text-sm font-medium mb-2 tracking-tight relative">
          Hola, {userName.split(' ')[0]}
        </p>
      )}

      {/* Titular principal */}
      <h1
        className="font-bold leading-[1.08] tracking-tight text-white mb-7 relative"
        style={{ fontSize: 'clamp(1.9rem, 7vw, 2.6rem)' }}
      >
        ¿Qué vas<br />
        <span className="text-gradient">a descubrir hoy?</span>
      </h1>

      {/* Barra de búsqueda prominente */}
      <button
        onClick={openSearch}
        className="relative w-full flex items-center gap-3.5 px-4 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/8 hover:border-white/18 transition-all group mb-5 text-left"
        style={{ boxShadow: '0 0 0 0 rgba(147,51,234,0)' }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 28px rgba(147,51,234,0.07)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 0 rgba(147,51,234,0)')}
      >
        {/* Ícono con gradiente de marca */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={{ background: 'linear-gradient(135deg, rgba(147,51,234,0.25), rgba(219,39,119,0.12))' }}>
          <Search className="w-[17px] h-[17px] text-primary-300 group-hover:text-primary-200 transition-colors" />
        </div>

        {/* Placeholder */}
        <span className="text-sm text-white/30 font-medium flex-1 group-hover:text-white/40 transition-colors">
          Restaurantes, bares, museos, parques...
        </span>

        {/* Atajo de teclado */}
        <kbd className="flex-shrink-0 hidden sm:flex items-center px-1.5 py-0.5 rounded-md bg-white/5 border border-white/8 text-[10px] text-white/20 font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Pills de categoría */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-0.5">
        {CATEGORIES.map(({ label, icon: Icon, color }) => (
          <button
            key={label}
            onClick={() => navigate('/comunidad')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${color}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeWelcome;
