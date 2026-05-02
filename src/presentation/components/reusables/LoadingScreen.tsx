import React from 'react';

interface LoadingScreenProps {
  message: string;
  error?: string;
  onRetry?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message, error, onRetry }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="text-6xl animate-bounce">🦕</div>
        <p className="text-lg font-medium text-muted-foreground">{message}</p>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;