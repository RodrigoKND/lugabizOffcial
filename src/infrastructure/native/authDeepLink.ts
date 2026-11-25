import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { supabase } from '@lib/supabase/client';
import { parseAuthCallback } from './authCallback';

// Cuando Google devuelve al usuario a la app por el enlace propio, se completa la sesión y se cierra el navegador.
export async function listenAuthDeepLink(): Promise<() => Promise<void>> {
  const handle = await App.addListener('appUrlOpen', async ({ url }) => {
    const result = parseAuthCallback(url);
    if (!result) return;
    try {
      const { error } = 'code' in result
        ? await supabase.auth.exchangeCodeForSession(result.code)
        : await supabase.auth.setSession({ access_token: result.accessToken, refresh_token: result.refreshToken });
      if (error) console.error('[authDeepLink] no se pudo iniciar sesión', error);
    } finally {
      Browser.close().catch(() => {});
    }
  });
  return () => handle.remove();
}
