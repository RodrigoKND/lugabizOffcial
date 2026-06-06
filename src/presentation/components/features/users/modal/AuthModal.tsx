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
