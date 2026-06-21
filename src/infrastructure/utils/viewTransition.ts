// ⚠️ NO USAR: este enfoque rompía la navegación.
//
// La versión anterior monkey-patcheaba window.history.pushState para envolverlo
// en document.startViewTransition(). React Router v7 usa pushState de forma
// SÍNCRONA, y al diferir el push real dentro del callback async de la View
// Transition (con requestAnimationFrame), se desincronizaba la URL del estado
// interno del router: la URL cambiaba pero la página no re-renderizaba hasta
// volver a interactuar (había que dar varios clicks para navegar).
//
// Si en el futuro se quieren View Transitions, usar el soporte NATIVO de
// React Router v7 en lugar de parchear el History API:
//   <Link to="/ruta" viewTransition>…</Link>
//   navigate('/ruta', { viewTransition: true })
//
// Se deja la función como no-op para no romper imports antiguos.
export function enableViewTransitions(): void {
  /* no-op a propósito — ver comentario arriba */
}
