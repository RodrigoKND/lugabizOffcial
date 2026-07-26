// Caché genérico basado en IndexedDB (NO localStorage): persiste entre
// recargas de página, soporta objetos complejos (Date, arrays anidados) sin
// serializar a texto, y es asíncrono así que nunca bloquea el hilo principal.
// Si IndexedDB no está disponible (modo privado de Safari, etc.) todas las
// funciones devuelven/no hacen nada — la app sigue funcionando sin caché.

const DB_NAME = 'lugabiz-cache';
const DB_VERSION = 1;
const STORE = 'kv';

interface CacheEntry<T> {
  data: T;
  savedAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

/** Lee `key` si existe y tiene menos de `maxAgeMs`. Si expiró o no hay IndexedDB, devuelve null. */
export async function idbGet<T>(key: string, maxAgeMs: number): Promise<T | null> {
  if (typeof indexedDB === 'undefined') return null;
  try {
    const db = await openDb();
    return await new Promise<T | null>((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
      req.onsuccess = () => {
        const entry = req.result as CacheEntry<T> | undefined;
        if (!entry || Date.now() - entry.savedAt > maxAgeMs) return resolve(null);
        resolve(entry.data);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function idbSet<T>(key: string, data: T): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({ data, savedAt: Date.now() } satisfies CacheEntry<T>, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* sin caché disponible, no es crítico */
  }
}
