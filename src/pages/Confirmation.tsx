import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, RefreshCw, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { authService } from '../lib/supabase';

const Confirmation: React.FC = () => {
  const navigate = useNavigate();
  const { user, resendConfirmation } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const userSession = async () => {
      if (!user) {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          navigate('/', { replace: true });
        }
      }
      else {
        setEmail(user.email);
      }
    }
    userSession();
  }, [navigate, user])

  const handleResendConfirmation = async () => {
    if (!email.trim()) return;

    setIsResending(true);
    try {
      const success = await resendConfirmation(email);
      if (success) {
        toast.success('Email de confirmación enviado. Revisa tu bandeja de entrada.');
      } else {
        toast.error('Error al enviar el email. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Error al enviar el email. Inténtalo de nuevo.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/', { replace: true });
  };

  // If user is logged in, don't render anything (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-primary-500 to-tomato flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-8 text-center">
          {/* Dinosaur Mascot */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-8xl mb-6"
          >
            🦕
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Confirma tu email!
            </h2>
            <p className="text-gray-600 mb-6">
              Te hemos enviado un enlace de confirmación a tu correo electrónico.
              Haz clic en el enlace para activar tu cuenta.
            </p>

            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu email para reenviar confirmación"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                />
              </div>

              <button
                onClick={handleResendConfirmation}
                disabled={!email.trim() || isResending}
                className="w-full bg-gradient-to-r from-primary-500 to-tomato text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Reenviando...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Reenviar confirmación</span>
                  </>
                )}
              </button>
              <button
                onClick={handleGoToLogin}
                className="w-full bg-gray-100 text-gray-800 py-3 px-2 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <ArrowRight className="w-5 h-5" />
                <span>Si ya confirmó su email, inicie sesión</span>
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Confirmation;