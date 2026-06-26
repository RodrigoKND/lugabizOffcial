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

// Centro de Cochabamba (Plaza 14 de Septiembre) — ciudad por defecto.
const COCHABAMBA = { lat: -17.3935, lng: -66.157 }

// Radio que abarca el área metropolitana de una ciudad (Cochabamba + Quillacollo, Sacaba,
// Tiquipaya, Colcapirhua, Vinto…). Las sugerencias se RESTRINGEN a este círculo.
const CITY_RADIUS_M = 30000

export interface SearchOpts {
  /** Punto para PRIORIZAR resultados dentro de la ciudad (ej. el pin del mapa). */
  near?: { lat: number; lng: number }
  /** Centro de la ciudad que RESTRINGE el área de búsqueda. Default: ciudad del usuario / Cochabamba */
  city?: { lat: number; lng: number }
  /** Busca en toda Bolivia sin restringir a la ciudad (ej. el Asesor, que analiza otras zonas). */
  allCountry?: boolean
  /** Para cancelar peticiones obsoletas desde el autocompletado */
  signal?: AbortSignal
}

/**
 * Resuelve el centro de la ciudad del usuario UNA sola vez:
 * - Si el navegador ya tiene permiso de ubicación CONCEDIDO → usa su ubicación real
 *   (así un usuario de Santa Cruz autocompleta en Santa Cruz, no Cochabamba). No pide permiso nuevo.
 * - En cualquier otro caso (sin permiso, sin soporte, error) → Cochabamba.
 */
let cityCenterPromise: Promise<{ lat: number; lng: number }> | null = null
export function resolveCityCenter(): Promise<{ lat: number; lng: number }> {
  if (cityCenterPromise) return cityCenterPromise
  cityCenterPromise = (async () => {
    try {
      if (!('geolocation' in navigator) || !('permissions' in navigator)) return COCHABAMBA
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
      if (status.state !== 'granted') return COCHABAMBA
      return await new Promise<{ lat: number; lng: number }>(resolve => {
        navigator.geolocation.getCurrentPosition(
          p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
          () => resolve(COCHABAMBA),
          { maximumAge: 300000, timeout: 4000, enableHighAccuracy: false },
        )
      })
    } catch {
      return COCHABAMBA
    }
  })()
  return cityCenterPromise
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

async function searchGeoapify(query: string, opts: SearchOpts, city: { lat: number; lng: number }): Promise<GeoResult[]> {
  // El pin del mapa (near) prioriza dentro de la ciudad; si no hay pin, prioriza el centro de la ciudad.
  const near = opts.near ?? city
  const params = new URLSearchParams({
    text: query,
    apiKey: GEOAPIFY_KEY!,
    // Por defecto RESTRINGE a la ciudad (círculo); con allCountry busca en toda Bolivia.
    filter: opts.allCountry ? 'countrycode:bo' : `circle:${city.lng},${city.lat},${CITY_RADIUS_M}`,
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

async function searchNominatim(query: string, city: { lat: number; lng: number }, allCountry: boolean, signal?: AbortSignal): Promise<GeoResult[]> {
  await rateLimit()
  const toResult = (d: { display_name: string; lat: string; lon: string }): GeoResult => {
    const { main, secondary } = splitDisplay(d.display_name)
    return { displayName: d.display_name, mainText: main, secondaryText: secondary, lat: parseFloat(d.lat), lng: parseFloat(d.lon) }
  }
  let bound = ''
  if (!allCountry) {
    // Caja delimitadora (~30km) alrededor de la ciudad + bounded=1 → restringe a la ciudad.
    const dLat = CITY_RADIUS_M / 111320
    const dLng = CITY_RADIUS_M / (111320 * Math.cos(city.lat * Math.PI / 180))
    const viewbox = `${city.lng - dLng},${city.lat - dLat},${city.lng + dLng},${city.lat + dLat}`
    bound = `&bounded=1&viewbox=${viewbox}`
  }
  const url = `${NOMINATIM}/search?q=${encodeURIComponent(query)}&format=json&limit=6&countrycodes=bo&addressdetails=0${bound}`
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal })
  if (!res.ok) return []
  const data = await res.json() as Array<{ display_name: string; lat: string; lon: string }>
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
    // La ciudad restringe el área: la pasada por opts, o la del usuario (si dio permiso) / Cochabamba.
    const city = opts.city ?? await resolveCityCenter()
    return GEOAPIFY_KEY
      ? await searchGeoapify(query, opts, city)
      : await searchNominatim(query, city, !!opts.allCountry, opts.signal)
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
