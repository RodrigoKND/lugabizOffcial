import { AtSign, Check, Loader2, X } from 'lucide-react';
import { useUsernameAvailability } from '@presentation/hooks';

interface UsernameFieldProps {
  value: string;
  onChange: (value: string) => void;
  initialUsername?: string;
}

const STATUS_COPY: Record<string, { text: string; className: string } | undefined> = {
  checking: { text: 'Revisando...', className: 'text-stone-400' },
  available: { text: 'Disponible', className: 'text-green-600' },
  taken: { text: 'Ese nombre de usuario ya existe', className: 'text-red-500' },
  invalid: { text: '3-20 caracteres: letras, números, punto o guión bajo', className: 'text-red-500' },
};

const UsernameField: React.FC<UsernameFieldProps> = ({ value, onChange, initialUsername }) => {
  const status = useUsernameAvailability(value, initialUsername);
  const copy = STATUS_COPY[status];

  return (
    <div>
      <label className="block text-xs font-semibold text-text-secondary uppercase mb-1.5">Nombre de usuario</label>
      <div className="relative">
        <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/\s/g, ''))}
          placeholder="tu_apodo"
          maxLength={20}
          className="w-full pl-10 pr-9 py-2.5 bg-primary-50/50 border border-primary-100 rounded-xl text-sm outline-none focus:border-primary-300 focus:bg-white transition-all"
        />
        {status === 'checking' && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 animate-spin" />}
        {status === 'available' && <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />}
        {(status === 'taken' || status === 'invalid') && <X className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />}
      </div>
      {copy && <p className={`text-[11px] mt-1 ${copy.className}`}>{copy.text}</p>}
    </div>
  );
};

export default UsernameField;
