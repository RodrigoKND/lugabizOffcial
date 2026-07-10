import type { AuthModalHeaderProps } from '@domain/entities/props/AuthProps';

export default function AuthModalHeader({ mode }: AuthModalHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="mb-5">
        <span className="text-2xl font-bold text-gradient">Lugabiz</span>
      </div>
      <h3 className="text-[1.4rem] font-bold text-white mb-1.5 tracking-tight">
        {mode === 'login' ? 'Bienvenido de vuelta' : 'Únete a la comunidad'}
      </h3>
      <p className="text-white/40 text-sm">
        {mode === 'login' ? 'Accede para descubrir lo local' : 'Empieza a descubrir tu ciudad'}
      </p>
    </div>
  );
}
