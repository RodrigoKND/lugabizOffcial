import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuthModal } from '@presentation/hooks/auth/useAuthModal';
import { AuthModalProps } from './AuthModal.types';
import AuthModalHeader from './AuthModalHeader';
import SocialLogin from './SocialLogin';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const {
    mode, showPassword, setShowPassword, formData, error, isLoading,
    handleSubmit, handleGoogleLogin, switchMode, handleClose, updateField,
  } = useAuthModal(initialMode, onClose);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="relative bg-[#150d2e] border border-white/8 rounded-3xl shadow-2xl shadow-black/60 w-full max-w-md mx-4 max-h-[85vh] overflow-y-auto"
        >
          <button onClick={handleClose}
            className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-white/8 hover:bg-white/12 transition-all flex items-center justify-center">
            <X className="w-4 h-4 text-white/50" />
          </button>

          <div className="p-8">
            <AuthModalHeader mode={mode} />
            <SocialLogin onGoogleLogin={handleGoogleLogin} />

            {mode === 'login' ? (
              <LoginForm
                formData={formData}
                error={error}
                isLoading={isLoading}
                showPassword={showPassword}
                onSubmit={handleSubmit}
                onTogglePassword={() => setShowPassword(!showPassword)}
                onChange={updateField}
              />
            ) : (
              <RegisterForm
                formData={formData}
                error={error}
                isLoading={isLoading}
                showPassword={showPassword}
                onSubmit={handleSubmit}
                onTogglePassword={() => setShowPassword(!showPassword)}
                onChange={updateField}
              />
            )}

            <div className="text-center pt-6">
              <p className="text-white/35 text-sm">
                {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                <button type="button" onClick={switchMode}
                  className="ml-2 text-primary-400 hover:text-primary-300 font-semibold transition-colors">
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
