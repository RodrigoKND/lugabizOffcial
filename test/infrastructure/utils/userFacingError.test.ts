import { describe, it, expect } from 'vitest';
import { userFacingMessage, GENERIC_NETWORK, GENERIC_SERVER } from '@/infrastructure/utils/userFacingError';

describe('userFacingMessage', () => {
  it('un fallo de red se explica sin tecnicismos', () => {
    expect(userFacingMessage(new TypeError('Failed to fetch'))).toBe(GENERIC_NETWORK);
    expect(userFacingMessage(new Error('Load failed'))).toBe(GENERIC_NETWORK);
    expect(userFacingMessage('NetworkError when attempting to fetch resource.')).toBe(GENERIC_NETWORK);
  });

  it('nunca muestra el error genérico de las edge functions', () => {
    expect(userFacingMessage(new Error('Edge Function returned a non-2xx status code'), 'No se pudo enviar.')).toBe('No se pudo enviar.');
  });

  it('esconde errores de base de datos, permisos y tokens', () => {
    for (const raw of [
      'duplicate key value violates unique constraint "x"',
      'new row violates row-level security policy',
      'JWT expired',
      'PGRST116: The result contains 0 rows',
      "Cannot read properties of undefined (reading 'id')",
      'The resource already exists (supabase storage)',
    ]) {
      expect(userFacingMessage(new Error(raw))).toBe(GENERIC_SERVER);
    }
  });

  it('deja pasar los mensajes pensados para el usuario', () => {
    expect(userFacingMessage(new Error('Ya tienes una verificación en revisión.'))).toBe('Ya tienes una verificación en revisión.');
  });

  it('usa el texto de respaldo cuando no hay mensaje utilizable', () => {
    expect(userFacingMessage(undefined, 'Intenta de nuevo.')).toBe('Intenta de nuevo.');
    expect(userFacingMessage(new Error(''), 'Intenta de nuevo.')).toBe('Intenta de nuevo.');
    expect(userFacingMessage({ foo: 1 })).toBe(GENERIC_SERVER);
  });
});
