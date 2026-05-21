import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@presentation/context';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, loginWithGoogle, register, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        const success = await login(formData.email, formData.password);
        if (!success) return setError('Email o contraseña incorrectos');
        handleClose();
      } else {
        const result = await register(formData.name, formData.email, formData.password);
        if (!result.success) return setError('El email ya está registrado');
        handleClose();
      }
    } catch {
      setError('Ha ocurrido un error. Inténtalo de nuevo.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const success = await loginWithGoogle();
      if (!success) toast.error('Error al iniciar con Google');
    } catch {
      toast.error('Error al iniciar con Google');
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', password: '' });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center md:p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
        >
          <button onClick={handleClose}
            className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 transition-all flex items-center justify-center">
            <X className="w-4 h-4 text-stone-500" />
          </button>

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🦕</div>
              <h3 className="text-2xl font-bold text-stone-800 mb-1">
                {mode === 'login' ? 'Bienvenido' : 'Crear Cuenta'}
              </h3>
              <p className="text-stone-500 text-sm">
                {mode === 'login' ? 'Accede a tu cuenta' : 'Únete a la comunidad'}
              </p>
            </div>

            <button type="button" onClick={handleGoogleLogin}
              className="w-full mb-5 px-4 py-3 border-2 border-stone-200 rounded-2xl hover:border-stone-300 hover:bg-stone-50 transition-all flex items-center justify-center gap-3 group">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-stone-700 font-medium text-sm">Continuar con Google</span>
            </button>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200" /></div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-stone-400">o con email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input type="text" name="name" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-400 focus:bg-white focus:ring-0 transition-all text-stone-800 placeholder:text-stone-400 outline-none text-sm"
                    placeholder="Nombre completo" required />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input type="email" name="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-400 focus:bg-white focus:ring-0 transition-all text-stone-800 placeholder:text-stone-400 outline-none text-sm"
                  placeholder="Correo electrónico" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  className="w-full pl-12 pr-12 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-400 focus:bg-white focus:ring-0 transition-all text-stone-800 placeholder:text-stone-400 outline-none text-sm"
                  placeholder="Contraseña" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <motion.div initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">
                  {error}
                </motion.div>
              )}

              <button type="submit" disabled={isLoading}
                className="w-full bg-amber-500 text-white py-3.5 rounded-2xl font-semibold hover:bg-amber-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2">
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> {mode === 'login' ? 'Iniciando...' : 'Registrando...'}</>
                ) : (
                  mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'
                )}
              </button>
            </form>

            <div className="text-center pt-6">
              <p className="text-stone-500 text-sm">
                {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                <button type="button" onClick={switchMode}
                  className="ml-2 text-amber-600 hover:text-amber-700 font-semibold transition-colors">
                  {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
