// Enlace al que Google/Supabase devuelve al usuario después de iniciar sesión en el navegador del sistema.
// Debe estar en la lista de "Redirect URLs" de Supabase y registrado como esquema en Android (intent-filter) e iOS (URL types).
export const NATIVE_AUTH_REDIRECT = 'com.lugabiz.app://auth-callback';

export type AuthCallback = { code: string } | { accessToken: string; refreshToken: string };

// Lee el enlace de regreso. Solo acepta el nuestro y solo si trae un código (PKCE) o ambos tokens; todo lo demás se descarta.
export function parseAuthCallback(url: string): AuthCallback | null {
  if (!url.startsWith(NATIVE_AUTH_REDIRECT)) return null;
  const rest = url.slice(NATIVE_AUTH_REDIRECT.length);
  if (rest && !/^[?#]/.test(rest)) return null;

  const query = new URLSearchParams(rest.startsWith('?') ? rest.slice(1).split('#')[0] : '');
  const hash = new URLSearchParams(rest.includes('#') ? rest.slice(rest.indexOf('#') + 1) : '');
  if (query.get('error') || hash.get('error')) return null;

  const code = query.get('code');
  if (code) return { code };
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');
  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}
