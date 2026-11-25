import toast from 'react-hot-toast';

const KEY = '_lugabiz_vn';

// Tras el primer voto sin sesión, una sola invitación (nunca insiste) para que el voto quede en el perfil.
export function nudgeLoginOnce(): void {
  try {
    if (localStorage.getItem(KEY)) return;
    localStorage.setItem(KEY, '1');
  } catch {
    return;
  }
  toast('Tu voto cuenta. Inicia sesión para guardarlo en tu perfil', { icon: '🔥' });
}
