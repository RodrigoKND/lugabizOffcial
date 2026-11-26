import { supabase } from '@lib/supabase/client'

const FRIENDLY = 'El asesor está ocupado en este momento. Intentá de nuevo en unos segundos.'
const NON_2XX = /non-2xx|edge function|failed to send|fetch/i

/** Error cuyo mensaje ya es seguro mostrar al usuario. */
export class AdvisorError extends Error {
  constructor(message: string, readonly retryable: boolean) { super(message) }
}

/** Lee `{ error }` del cuerpo de una respuesta HTTP no-2xx de la edge function. */
export async function toAdvisorError(error: unknown): Promise<AdvisorError> {
  const ctx = (error as { context?: unknown })?.context
  if (ctx instanceof Response) {
    let msg = ''
    try { msg = String((await ctx.clone().json())?.error ?? '') } catch { /* sin cuerpo JSON */ }
    // 4xx con mensaje propio (límite diario, idea inválida): mostrarlo, no reintentar.
    if (msg && ctx.status < 500) return new AdvisorError(msg, false)
    return new AdvisorError(msg && !NON_2XX.test(msg) ? msg : FRIENDLY, true)
  }
  return new AdvisorError(FRIENDLY, true)
}

/** Invoca la función; reintenta una vez ante fallos transitorios (5xx / red). */
export async function invokeAdvisor<T>(name: string, body: unknown, retries = 1): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const { data, error } = await supabase.functions.invoke(name, { body })
    if (!error) {
      const err = (data as { error?: string } | null)?.error
      if (!data || err) throw new AdvisorError(err && !NON_2XX.test(err) ? err : FRIENDLY, false)
      return data as T
    }
    const e = await toAdvisorError(error)
    if (!e.retryable || attempt >= retries) throw e
  }
}
