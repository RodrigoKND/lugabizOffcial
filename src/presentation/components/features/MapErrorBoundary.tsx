import React, { Component, ReactNode } from 'react';
import { MapPin, RefreshCw, Globe, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry?.();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-auto">
          <div className="text-center p-6 sm:p-8 max-w-md mx-auto animate-in fade-in duration-500">
            <div className="relative mb-6">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3">
                <MapPin className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xl">📍</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
              Mapa temporalmente no disponible
            </h2>

            <p className="text-slate-600 mb-6 text-sm sm:text-base leading-relaxed">
              Tu navegador no soporta WebGL, necesario para mostrar el mapa interactivo. 
              Prueba una de estas opciones:
            </p>

            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-100 mb-6 text-left">
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Soluciones rápidas:
              </h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  Usa Chrome, Firefox o Safari actualizado
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  Habilita aceleración de hardware en tu navegador
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  Actualiza los drivers de tu tarjeta gráfica
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  Desactiva extensions que bloqueen WebGL
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>

              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-medium rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
              >
                <Globe className="w-4 h-4" />
                Volver al inicio
              </Link>
            </div>

            <p className="mt-6 text-xs text-slate-400">
              Lugabiz necesita WebGL para mostrar mapas interactivos
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;