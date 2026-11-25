import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ownerVerificationService } from '@/lib/supabase/services/user/ownerVerification';

const db = vi.hoisted(() => ({ functions: { invoke: vi.fn() }, storage: { from: vi.fn() } }));
vi.mock('@lib/supabase/client', () => ({ supabase: db }));

const files = {
  selfieFile: new File(['s'], 's.jpg', { type: 'image/jpeg' }),
  ciFrontFile: new File(['f'], 'f.jpg', { type: 'image/jpeg' }),
  ciBackFile: new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
};
const params = { businessName: 'Café Sol', fullName: 'Ana Pérez', ...files };

describe('ownerVerificationService.precheckIdentity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    db.storage.from.mockReturnValue({ upload: vi.fn().mockResolvedValue({ error: null }) });
  });

  it('devuelve el veredicto de la función', async () => {
    db.functions.invoke.mockResolvedValue({ data: { verdict: 'ok', message: 'Listo', extracted: {}, aiScore: 0.9 }, error: null });
    const r = await ownerVerificationService.precheckIdentity('u1', params);
    expect(r).toMatchObject({ verdict: 'ok', message: 'Listo', aiScore: 0.9 });
    expect(r.docPaths).toHaveLength(3);
    expect(r.docPaths[0]).toMatch(/^u1\/identity\/selfie-/);
  });

  it('un "Failed to fetch" se muestra como problema de conexión, no como error técnico', async () => {
    db.functions.invoke.mockResolvedValue({ data: null, error: new TypeError('Failed to fetch') });
    await expect(ownerVerificationService.precheckIdentity('u1', params)).rejects.toThrow('No pudimos conectar con el servicio');
  });

  it('el error genérico de la edge function se reemplaza por un texto claro', async () => {
    db.functions.invoke.mockResolvedValue({ data: null, error: new Error('Edge Function returned a non-2xx status code') });
    const err = await ownerVerificationService.precheckIdentity('u1', params).catch(e => e as Error);
    expect(err.message).toBe('No pudimos revisar tus fotos. Intenta de nuevo en un momento.');
    expect(err.message).not.toMatch(/edge function|non-2xx/i);
  });

  it('si la función explica el motivo en el cuerpo (4xx), se muestra ese mensaje en español', async () => {
    const response = new Response(JSON.stringify({ error: 'Ingresa tu nombre completo.' }), { status: 400 });
    const httpError = Object.assign(new Error('Edge Function returned a non-2xx status code'), { context: response });
    db.functions.invoke.mockResolvedValue({ data: null, error: httpError });
    await expect(ownerVerificationService.precheckIdentity('u1', params)).rejects.toThrow('Ingresa tu nombre completo.');
  });

  it('un error técnico dentro del cuerpo tampoco se muestra', async () => {
    db.functions.invoke.mockResolvedValue({ data: { error: 'duplicate key value violates unique constraint' }, error: null });
    await expect(ownerVerificationService.precheckIdentity('u1', params)).rejects.toThrow('No pudimos revisar tus fotos');
  });

  it('si falla la subida de fotos no se filtra el error de almacenamiento', async () => {
    db.storage.from.mockReturnValue({ upload: vi.fn().mockResolvedValue({ error: new Error('new row violates row-level security policy') }) });
    const err = await ownerVerificationService.precheckIdentity('u1', params).catch(e => e as Error);
    expect(err.message).toBe('No pudimos subir tus fotos. Revisa tu conexión e intenta de nuevo.');
    expect(db.functions.invoke).not.toHaveBeenCalled();
  });
});
