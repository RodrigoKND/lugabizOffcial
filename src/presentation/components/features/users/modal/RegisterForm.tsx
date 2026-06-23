import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { FormData } from './AuthModal.types';

interface RegisterFormProps {
  formData: FormData;
  error: string;
  isLoading: boolean;
  showPassword: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onTogglePassword: () => void;
  onChange: (field: keyof FormData, value: string) => void;
}

export default function RegisterForm({
  formData, error, isLoading, showPassword,
  onSubmit, onTogglePassword, onChange,
}: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="relative">
        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input type="text" value={formData.name} onChange={e => onChange('name', e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:border-primary-400/60 focus:bg-white/8 focus:ring-0 transition-all text-white placeholder:text-white/25 outline-none text-sm"
          placeholder="Nombre completo" required />
      </div>
      <div className="relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input type="email" value={formData.email} onChange={e => onChange('email', e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:border-primary-400/60 focus:bg-white/8 focus:ring-0 transition-all text-white placeholder:text-white/25 outline-none text-sm"
          placeholder="Correo electrónico" required />
      </div>
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input type={showPassword ? 'text' : 'password'} value={formData.password}
          onChange={e => onChange('password', e.target.value)}
          className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:border-primary-400/60 focus:bg-white/8 focus:ring-0 transition-all text-white placeholder:text-white/25 outline-none text-sm"
          placeholder="Contraseña" required />
        <button type="button" onClick={onTogglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {error && (
        <motion.div initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-2xl text-sm">
          {error}
        </motion.div>
      )}

      <button type="submit" disabled={isLoading}
        className="w-full bg-primary-500 text-white py-3.5 rounded-2xl font-semibold hover:bg-primary-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 mt-1">
        {isLoading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Registrando...</>
        ) : 'Crear cuenta'}
      </button>
    </form>
  );
}
