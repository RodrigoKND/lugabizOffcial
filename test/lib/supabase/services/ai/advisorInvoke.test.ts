import { describe, it, expect, vi, beforeEach } from 'vitest'

const invoke = vi.fn()
vi.mock('@lib/supabase/client', () => ({ supabase: { functions: { invoke: (...a: unknown[]) => invoke(...a) } } }))

import { invokeAdvisor, toAdvisorError } from '@lib/supabase/services/ai/advisorInvoke'

const httpError = (status: number, body: unknown) => ({
  message: 'Edge Function returned a non-2xx status code',
  context: new Response(JSON.stringify(body), { status }),
})

describe('advisorInvoke', () => {
  beforeEach(() => invoke.mockReset())

  it('nunca expone el mensaje "non-2xx"', async () => {
    const e = await toAdvisorError(httpError(502, {}))
    expect(e.message).not.toMatch(/non-2xx/i)
    expect(e.retryable).toBe(true)
  })

  it('muestra el mensaje propio en 4xx y no reintenta', async () => {
    invoke.mockResolvedValue({ data: null, error: httpError(429, { error: 'Llegaste al límite diario' }) })
    await expect(invokeAdvisor('x', {})).rejects.toThrow('Llegaste al límite diario')
    expect(invoke).toHaveBeenCalledTimes(1)
  })

  it('reintenta una vez ante 5xx y devuelve el resultado', async () => {
    invoke
      .mockResolvedValueOnce({ data: null, error: httpError(502, {}) })
      .mockResolvedValueOnce({ data: { ok: 1 }, error: null })
    await expect(invokeAdvisor('x', {})).resolves.toEqual({ ok: 1 })
    expect(invoke).toHaveBeenCalledTimes(2)
  })

  it('tras agotar reintentos lanza mensaje amable', async () => {
    invoke.mockResolvedValue({ data: null, error: httpError(500, {}) })
    await expect(invokeAdvisor('x', {})).rejects.toThrow(/ocupado/)
    expect(invoke).toHaveBeenCalledTimes(2)
  })
})
