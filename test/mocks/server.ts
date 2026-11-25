import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

/** Handlers globales; cada test agrega los suyos con `server.use(...)`. */
export const defaultHandlers = [
  http.get('*/rest/v1/health', () => HttpResponse.json({ ok: true })),
];

export const server = setupServer(...defaultHandlers);
