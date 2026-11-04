import { Component, type ReactNode, type ErrorInfo } from 'react';
import { RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Última red de seguridad: si algo falla al renderizar o una página no carga, se ve esto en vez de una pantalla vacía.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-screen bg-lg-ground flex flex-col items-center justify-center p-8 text-center" role="alert">
        <h2 className="font-flyer text-4xl text-lg-text mb-3">Se nos cruzó un cable</h2>
        <p className="text-sm text-lg-dim mb-6 max-w-sm">
          La página no pudo cargar. Recárgala y vuelves al plan.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-lg-accent text-lg-ink rounded-full text-sm font-extrabold hover:brightness-110 transition"
        >
          <RefreshCw className="w-4 h-4" /> Recargar
        </button>
      </div>
    );
  }
}
