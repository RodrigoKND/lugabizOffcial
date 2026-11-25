import { safeUuid } from './uuid';

const KEY = '_lugabiz_d';
let inMemory: string | null = null;

// Identifica este navegador para votar sin cuenta. Si el almacenamiento está bloqueado, dura lo que dure la pestaña.
export function getDeviceId(): string {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;
    const fresh = safeUuid();
    localStorage.setItem(KEY, fresh);
    return fresh;
  } catch {
    inMemory ??= safeUuid();
    return inMemory;
  }
}
