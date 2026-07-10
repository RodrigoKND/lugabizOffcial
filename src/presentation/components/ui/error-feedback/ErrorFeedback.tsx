import { AlertTriangle, Info, AlertCircle, XCircle, X } from 'lucide-react';
import { cn } from '@infrastructure/utils/cn';
import type { AppError, ErrorSeverity } from '@errors/index';

const severityConfig: Record<ErrorSeverity, { icon: typeof AlertTriangle; container: string; text: string; iconColor: string }> = {
  info: { icon: Info, container: 'bg-blue-500/10 border-blue-500/25 text-blue-400', text: 'text-blue-400', iconColor: 'text-blue-400' },
  warning: { icon: AlertTriangle, container: 'bg-amber-500/10 border-amber-500/25 text-amber-400', text: 'text-amber-400', iconColor: 'text-amber-400' },
  error: { icon: AlertCircle, container: 'bg-red-500/10 border-red-500/25 text-red-400', text: 'text-red-400', iconColor: 'text-red-400' },
  critical: { icon: XCircle, container: 'bg-red-600/15 border-red-600/30 text-red-500', text: 'text-red-500', iconColor: 'text-red-500' },
};

interface ErrorFeedbackProps {
  error: AppError | string | null;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorFeedback({ error, onDismiss, className }: ErrorFeedbackProps) {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const severity: ErrorSeverity = typeof error === 'string' ? 'error' : error.severity;
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-start gap-3 px-4 py-3 rounded-2xl border text-sm', config.container, className)} role="alert">
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', config.iconColor)} />
      <p className={cn('flex-1', config.text)}>{errorMessage}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity" aria-label="Cerrar">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
