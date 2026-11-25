const KEY = '_lugabiz_ob';
export const DISMISS_DAYS = 14;
const DAY_MS = 86_400_000;

// El banner "¿Tienes un negocio?" solo es para quien aún no es dueño, y no insiste tras cerrarlo.
export function shouldShowOwnerBanner(isOwner: boolean, dismissedAt: number | null, now: number = Date.now()): boolean {
  if (isOwner) return false;
  return dismissedAt === null || now - dismissedAt > DISMISS_DAYS * DAY_MS;
}

export function readDismissedAt(): number | null {
  try {
    const n = Number(localStorage.getItem(KEY));
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function saveDismissedAt(at: number): void {
  try { localStorage.setItem(KEY, String(at)); } catch { /* almacenamiento bloqueado: solo no se recuerda */ }
}
