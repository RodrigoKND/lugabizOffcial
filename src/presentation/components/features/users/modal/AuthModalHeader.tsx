import { AuthMode } from './AuthModal.types';

interface AuthModalHeaderProps {
  mode: AuthMode;
}

export default function AuthModalHeader({ mode }: AuthModalHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="text-5xl mb-4">🦕</div>
      <h3 className="text-2xl font-bold text-stone-800 mb-1">
        {mode === 'login' ? 'Bienvenido' : 'Crear Cuenta'}
      </h3>
      <p className="text-stone-500 text-sm">
        {mode === 'login' ? 'Accede a tu cuenta' : 'Únete a la comunidad'}
      </p>
    </div>
  );
}
