import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from '@lib/errors';
import { installChunkRecovery } from '@infrastructure/utils/chunkRecovery';
import './index.css';
import './styles/base-interactions.css';
import './styles/modals-dark.css';
import './styles/pages-dark.css';

installChunkRecovery();

// El ErrorBoundary evita que un error inesperado deje la pantalla solo con el fondo (típico en Safari/iOS).
createRoot(document.getElementById('root')!).render(
  <ErrorBoundary onError={(error) => console.error('[app]', error)}>
    <App />
  </ErrorBoundary>
);
