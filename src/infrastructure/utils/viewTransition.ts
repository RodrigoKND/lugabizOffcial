export function enableViewTransitions(): void {
  if (typeof document === 'undefined') return;
  const hasViewTransition = 'startViewTransition' in document;

  const origPush = window.history.pushState.bind(window.history);

  window.history.pushState = ((...args: any[]) => {
    if (!hasViewTransition) {
      origPush(...args);
      return undefined;
    }
    try {
      (document as any).startViewTransition(() => {
        origPush(...args);
        // Wait for requestAnimationFrame so React commits the new DOM
        // before Chrome captures the "after" snapshot
        return new Promise<void>(resolve => {
          requestAnimationFrame(() => resolve());
        });
      });
    } catch {
      origPush(...args);
    }
    return undefined;
  }) as any;
}
