import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/base-interactions.css';
import './styles/modals-dark.css';
import './styles/pages-dark.css';

createRoot(document.getElementById('root')!).render(
  <App />
);
