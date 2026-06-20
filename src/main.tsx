import { createRoot } from 'react-dom/client';
import { enableViewTransitions } from '@infrastructure/utils/viewTransition';
import App from './App.tsx';
import './index.css';
import './styles/base-interactions.css';
import './styles/modals-dark.css';
import './styles/pages-dark.css';

enableViewTransitions();

createRoot(document.getElementById('root')!).render(
  <App />
);
