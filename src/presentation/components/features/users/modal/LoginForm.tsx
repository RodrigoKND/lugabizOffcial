import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { FormData } from './AuthModal.types';

interface LoginFormProps {
  formData: FormData;
  error: string;
  isLoading: boolean;
  showPassword: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onTogglePassword: () => void;
  onChange: (field: keyof FormData, value: string) => void;
}

export default function LoginForm({
  formData, error, isLoading, showPassword,
  onSubmit, onTogglePassword, onChange,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
        <input type="email" value={formData.email} onChange={e => onChange('email', e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-400 focus:bg-white focus:ring-0 transition-all text-stone-800 placeholder:text-stone-400 outline-none text-sm"
          placeholder="Correo electrónico" required />
      </div>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
        <input type={showPassword ? 'text' : 'password'} value={formData.password}
          onChange={e => onChange('password', e.target.value)}
          className="w-full pl-12 pr-12 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-400 focus:bg-white focus:ring-0 transition-all text-stone-800 placeholder:text-stone-400 outline-none text-sm"
          placeholder="Contraseña" required />
        <button type="button" onClick={onTogglePassword}
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
          <><Loader2 className="w-5 h-5 animate-spin" /> Iniciando...</>
        ) : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
