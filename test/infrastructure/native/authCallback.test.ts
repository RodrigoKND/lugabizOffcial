import { describe, it, expect } from 'vitest';
import { NATIVE_AUTH_REDIRECT, parseAuthCallback } from '@/infrastructure/native/authCallback';

describe('parseAuthCallback', () => {
  it('el enlace de regreso usa el esquema propio de la app', () => {
    expect(NATIVE_AUTH_REDIRECT).toBe('com.lugabiz.app://auth-callback');
  });

  it('lee el código del flujo PKCE', () => {
    expect(parseAuthCallback('com.lugabiz.app://auth-callback?code=abc123')).toEqual({ code: 'abc123' });
  });

  it('lee los tokens cuando vienen en el fragmento (#)', () => {
    expect(parseAuthCallback('com.lugabiz.app://auth-callback#access_token=A&refresh_token=R&expires_in=3600'))
      .toEqual({ accessToken: 'A', refreshToken: 'R' });
  });

  it('un error de Google (usuario canceló) no es un inicio de sesión', () => {
    expect(parseAuthCallback('com.lugabiz.app://auth-callback?error=access_denied&error_description=cancel')).toBeNull();
  });

  it('ignora cualquier otro enlace', () => {
    expect(parseAuthCallback('https://evil.example/auth-callback?code=abc')).toBeNull();
    expect(parseAuthCallback('com.lugabiz.app://otra-ruta?code=abc')).toBeNull();
    expect(parseAuthCallback('')).toBeNull();
  });

  it('un enlace sin código ni tokens se descarta', () => {
    expect(parseAuthCallback('com.lugabiz.app://auth-callback')).toBeNull();
    expect(parseAuthCallback('com.lugabiz.app://auth-callback#access_token=A')).toBeNull();
  });
});
