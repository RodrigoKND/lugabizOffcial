export interface GeoResult {
  /** Dirección completa formateada (lo que se guarda en el campo) */
  displayName: string
  /** Línea principal: calle + número / nombre del lugar (para resaltar) */
  mainText: string
  /** Línea secundaria: zona, ciudad, país */
  secondaryText: string
  lat: number
  lng: number
}

const GEOAPIFY_KEY = (import.meta.env.VITE_GEOAPIFY_API_KEY as string | undefined)?.trim()
const GEOAPIFY = 'https://api.geoapify.com/v1/geocode'

const NOMINATIM = 'https://nominatim.openstreetmap.org'
const USER_AGENT = 'LugabizApp/1.0'

// Centro de Cochabamba (Plaza 14 de Septiembre) — sesgo de búsqueda por defecto.
const COCHABAMBA = { lat: -17.3935, lng: -66.157 }

export interface SearchOpts {
  /** Punto para sesgar resultados (ej. ubicación del usuario). Default: Cochabamba */
  near?: { lat: number; lng: number }
  /** Para cancelar peticiones obsoletas desde el autocompletado */
  signal?: AbortSignal
}

/* ────────────────────────────────────────────────────────────────────────
 *  Geoapify (preferido) — rápido, sin límite de 1 req/seg, sesgado a Bolivia
 * ──────────────────────────────────────────────────────────────────────── */

interface GeoapifyProps {
  formatted?: string
  address_line1?: string
  address_line2?: string
  lat?: number
  lon?: number
}

function splitDisplay(name: string): { main: string; secondary: string } {
  const i = name.indexOf(',')
  if (i === -1) return { main: name, secondary: '' }
  return { main: name.slice(0, i).trim(), secondary: name.slice(i + 1).trim() }
}

async function searchGeoapify(query: string, opts: SearchOpts): Promise<GeoResult[]> {
  const near = opts.near ?? COCHABAMBA
  const params = new URLSearchParams({
    text: query,
    apiKey: GEOAPIFY_KEY!,
    filter: 'countrycode:bo',
    bias: `proximity:${near.lng},${near.lat}`,
    lang: 'es',
    limit: '6',
    format: 'json',
  })
  const res = await fetch(`${GEOAPIFY}/autocomplete?${params}`, { signal: opts.signal })
  if (!res.ok) return []
  const data = await res.json() as { results?: GeoapifyProps[] }
  const results = data.results ?? []
  return results
    .filter(r => typeof r.lat === 'number' && typeof r.lon === 'number')
    .map(r => {
      const display = r.formatted ?? [r.address_line1, r.address_line2].filter(Boolean).join(', ')
      return {
        displayName: display,
        mainText: r.address_line1 || splitDisplay(display).main,
        secondaryText: r.address_line2 || splitDisplay(display).secondary,
        lat: r.lat!,
        lng: r.lon!,
      }
    })
}

async function reverseGeoapify(lat: number, lng: number): Promise<string | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    apiKey: GEOAPIFY_KEY!,
    lang: 'es',
    format: 'json',
  })
  const res = await fetch(`${GEOAPIFY}/reverse?${params}`)
  if (!res.ok) return null
  const data = await res.json() as { results?: GeoapifyProps[] }
  return data.results?.[0]?.formatted ?? null
}

/* ────────────────────────────────────────────────────────────────────────
 *  Nominatim (respaldo) — usado solo si no hay clave de Geoapify
 * ──────────────────────────────────────────────────────────────────────── */

let lastRequest = 0
async function rateLimit() {
  const now = Date.now()
  const wait = Math.max(0, 1100 - (now - lastRequest))
  if (wait > 0) await new Promise(r => setTimeout(r, wait))
  lastRequest = Date.now()
}

async function searchNominatim(query: string, signal?: AbortSignal): Promise<GeoResult[]> {
  await rateLimit()
  const toResult = (d: { display_name: string; lat: string; lon: string }): GeoResult => {
    const { main, secondary } = splitDisplay(d.display_name)
    return { displayName: d.display_name, mainText: main, secondaryText: secondary, lat: parseFloat(d.lat), lng: parseFloat(d.lon) }
  }
  let url = `${NOMINATIM}/search?q=${encodeURIComponent(query)}&format=json&limit=6&countrycodes=bo&addressdetails=0`
  let res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal })
  if (!res.ok) return []
  let data = await res.json() as Array<{ display_name: string; lat: string; lon: string }>

  if (data.length === 0) {
    await rateLimit()
    url = `${NOMINATIM}/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=0`
    res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal })
    if (!res.ok) return []
    data = await res.json() as Array<{ display_name: string; lat: string; lon: string }>
  }
  return data.map(toResult)
}

async function reverseNominatim(lat: number, lng: number): Promise<string | null> {
  await rateLimit()
  const url = `${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) return null
  const data = await res.json() as { display_name?: string }
  return data.display_name ?? null
}

/* ────────────────────────────────────────────────────────────────────────
 *  API pública
 * ──────────────────────────────────────────────────────────────────────── */

export async function searchAddress(query: string, opts: SearchOpts = {}): Promise<GeoResult[]> {
  if (!query.trim() || query.length < 3) return []
  try {
    return GEOAPIFY_KEY
      ? await searchGeoapify(query, opts)
      : await searchNominatim(query, opts.signal)
  } catch (e) {
    // Una petición cancelada (AbortController) no es un error real: devolvemos vacío silenciosamente.
    if ((e as Error)?.name === 'AbortError') return []
    return []
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    return GEOAPIFY_KEY ? await reverseGeoapify(lat, lng) : await reverseNominatim(lat, lng)
  } catch {
    return null
  }
}
