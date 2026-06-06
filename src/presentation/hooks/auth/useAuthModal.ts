import { useState, useCallback } from 'react';
import { useAuth } from '@presentation/context';
import toast from 'react-hot-toast';
import { AuthMode, FormData } from '@presentation/components/features/users/modal/AuthModal.types';

export function useAuthModal(initialMode: AuthMode = 'login', onClose: () => void) {
  const { login, loginWithGoogle, register, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleClose = useCallback(() => {
    setFormData({ name: '', email: '', password: '' });
    setError('');
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
  }, [mode, formData, login, register, handleClose]);

  const handleGoogleLogin = useCallback(async () => {
    try {
      const success = await loginWithGoogle();
      if (!success) toast.error('Error al iniciar con Google');
    } catch {
      toast.error('Error al iniciar con Google');
    }
  }, [loginWithGoogle]);

  const switchMode = useCallback(() => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    setError('');
    setFormData({ name: '', email: '', password: '' });
  }, []);

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return {
    mode,
    showPassword,
    setShowPassword,
    formData,
    error,
    isLoading,
    handleSubmit,
    handleGoogleLogin,
    switchMode,
    handleClose,
    updateField,
  };
}
