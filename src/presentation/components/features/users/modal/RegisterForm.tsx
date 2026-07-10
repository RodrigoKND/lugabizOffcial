import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '@presentation/components/ui/input';
import { Button } from '@presentation/components/ui/button';
import { ErrorFeedback } from '@presentation/components/ui/error-feedback';
import type { AuthFormProps } from '@domain/entities/props/AuthProps';

export default function RegisterForm({
  formData, error, isLoading, showPassword,
  onSubmit, onTogglePassword, onChange,
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <Input
        type="text"
        value={formData.name}
        onChange={e => onChange('name', e.target.value)}
        icon={<User className="w-5 h-5" />}
        placeholder="Nombre completo"
        required
        autoComplete="name"
      />
      <Input
        type="email"
        value={formData.email}
        onChange={e => onChange('email', e.target.value)}
        icon={<Mail className="w-5 h-5" />}
        placeholder="Correo electrónico"
        required
        autoComplete="email"
      />
      <Input
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={e => onChange('password', e.target.value)}
        icon={<Lock className="w-5 h-5" />}
        rightIcon={showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        onRightIconClick={onTogglePassword}
        placeholder="Contraseña"
        required
        autoComplete="new-password"
      />

      <ErrorFeedback error={error} />

      <Button type="submit" disabled={isLoading} loading={isLoading} size="xl" fullWidth className="mt-1">
        {isLoading ? 'Registrando...' : 'Crear cuenta'}
      </Button>
    </form>
  );
}
