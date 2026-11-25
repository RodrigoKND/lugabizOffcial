export const GENERIC_NETWORK = 'No pudimos conectar con el servicio. Revisa tu conexión e intenta de nuevo.';
export const GENERIC_SERVER = 'Algo salió mal de nuestro lado. Intenta de nuevo en un momento.';

const NETWORK = /failed to fetch|networkerror|load failed|network request failed|err_internet|err_connection/i;
const TECHNICAL = /edge function|non-2xx|status code|\bfetch\b|\bjwt\b|supabase|postgres|pgrst|sqlstate|row-level|violates|duplicate key|constraint|undefined|null|typeerror|referenceerror|cannot read|unexpected token|\bhttp \d{3}\b|stack|storage|bucket|resource already exists/i;

// Lo que la gente ve cuando algo falla. Solo pasan los mensajes escritos para ellos; los errores técnicos
// (red, edge functions, base de datos, permisos) se reemplazan por un texto claro y el detalle queda en consola.
export function userFacingMessage(err: unknown, fallback: string = GENERIC_SERVER): string {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
  const msg = raw.trim();
  if (!msg) return fallback;
  if (NETWORK.test(msg)) return GENERIC_NETWORK;
  if (TECHNICAL.test(msg)) return fallback;
  return msg;
}
