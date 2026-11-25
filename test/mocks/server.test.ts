// @vitest-environment node
// jsdom reemplaza AbortSignal y rompe el fetch nativo de Node; este test de infraestructura usa entorno node.
import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from './server';

describe('MSW server', () => {
  it('responde con handlers por defecto', async () => {
    const res = await fetch('http://localhost/rest/v1/health');
    expect(await res.json()).toEqual({ ok: true });
  });

  it('permite sobrescribir handlers por test', async () => {
    server.use(http.get('*/rest/v1/health', () => HttpResponse.json({ ok: false }, { status: 503 })));
    const res = await fetch('http://localhost/rest/v1/health');
    expect(res.status).toBe(503);
  });

  it('falla si la petición no tiene handler (sin red real)', async () => {
    await expect(fetch('http://localhost/no-mock')).rejects.toThrow();
  });
});
