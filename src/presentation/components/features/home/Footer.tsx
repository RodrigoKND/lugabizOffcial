import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="hidden lg:block border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-12 gap-8">

          {/* Brand */}
          <div className="col-span-5">
            <div className="mb-4">
              <span className="text-white font-bold text-xl tracking-tight">Lugabiz</span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs">
              Descubre los mejores lugares y negocios locales. Lo local nunca debería ser invisible.
            </p>
          </div>

          {/* Explorar */}
          <div className="col-span-3 col-start-7">
            <h4 className="text-white/25 text-[10px] font-semibold uppercase tracking-widest mb-5">Explorar</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-white/45 hover:text-white text-sm transition-colors">Inicio</Link></li>
              <li><Link to="/comunidad" className="text-white/45 hover:text-white text-sm transition-colors">Comunidad</Link></li>
              <li><Link to="/asesor" className="text-white/45 hover:text-white text-sm transition-colors">Asesor IA</Link></li>
            </ul>
          </div>

          {/* Cuenta */}
          <div className="col-span-3 col-start-10">
            <h4 className="text-white/25 text-[10px] font-semibold uppercase tracking-widest mb-5">Tu cuenta</h4>
            <ul className="space-y-3">
              <li><Link to="/add-place" className="text-white/45 hover:text-white text-sm transition-colors">Publicar lugar</Link></li>
              <li><Link to="/profile" className="text-white/45 hover:text-white text-sm transition-colors">Mi perfil</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
