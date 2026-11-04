const FLAG = '_lugabiz_chunk_reload';
const SETTLE_MS = 10_000;

// Tras un despliegue, un navegador con el index.html viejo pide archivos que ya no existen: la página
// lazy nunca carga y queda solo el fondo. Se recarga UNA vez para traer el index nuevo; si vuelve a
// fallar, se deja pasar el error para que lo muestre el ErrorBoundary (sin bucles de recarga).
export function installChunkRecovery(win: Window = window, reload: () => void = () => win.location.reload()): void {
  win.addEventListener('vite:preloadError', (event) => {
    try {
      if (win.sessionStorage.getItem(FLAG) === '1') return;
      win.sessionStorage.setItem(FLAG, '1');
    } catch {
      return; // sin sessionStorage no se puede garantizar que no haya bucle
    }
    event.preventDefault();
    reload();
  });

  // Si la página se mantuvo viva, el próximo despliegue vuelve a poder recargar.
  win.setTimeout(() => {
    try { win.sessionStorage.removeItem(FLAG); } catch { /* sin almacenamiento */ }
  }, SETTLE_MS);
}
