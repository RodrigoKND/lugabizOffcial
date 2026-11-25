import { useEffect } from 'react';
import { isNativeApp } from '@infrastructure/native/platform';
import { registerNativePush } from '@infrastructure/native/nativePush';
import { startNativeProximity } from '@infrastructure/native/nativeProximity';
import { listenAuthDeepLink } from '@infrastructure/native/authDeepLink';
import { useAuth } from '@presentation/context/AuthContext';

// Al tocar una notificación se abre la pantalla indicada. La app carga la web desde dentro, así que basta navegar.
const openUrl = (url: string) => window.location.assign(url);

// Funciones nativas de la app instalada: push confiable y aviso de cercanía en segundo plano.
// En el navegador no hace nada. Si el usuario sale de sesión, se detiene todo.
export function useNativeApp() {
  const { user } = useAuth();
  const userId = user?.id;

  // El regreso del login con Google llega por un enlace: debe escucharse aunque todavía no haya sesión.
  useEffect(() => {
    if (!isNativeApp()) return;
    let stop: (() => Promise<void>) | undefined;
    let cancelled = false;
    listenAuthDeepLink()
      .then(remove => { if (cancelled) remove(); else stop = remove; })
      .catch(err => console.error('[useNativeApp:deepLink]', err));
    return () => { cancelled = true; stop?.(); };
  }, []);

  useEffect(() => {
    if (!isNativeApp() || !userId) return;
    let cancelled = false;
    const stops: Array<() => Promise<void>> = [];

    (async () => {
      try {
        const stopPush = await registerNativePush(userId, openUrl);
        if (cancelled) { await stopPush(); return; }
        stops.push(stopPush);
      } catch (err) { console.error('[useNativeApp:push]', err); }

      try {
        const stopProximity = await startNativeProximity(openUrl);
        if (cancelled) { await stopProximity(); return; }
        stops.push(stopProximity);
      } catch (err) { console.error('[useNativeApp:proximity]', err); }
    })();

    return () => {
      cancelled = true;
      stops.forEach(stop => { stop().catch(() => {}); });
    };
  }, [userId]);
}
