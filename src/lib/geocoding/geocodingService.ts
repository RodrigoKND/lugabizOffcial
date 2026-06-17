export interface GeoResult {
  displayName: string
  lat: number
  lng: number
}

const NOMINATIM = 'https://nominatim.openstreetmap.org'
const USER_AGENT = 'LugabizApp/1.0'

let lastRequest = 0
async function rateLimit() {
  const now = Date.now()
  const wait = Math.max(0, 1100 - (now - lastRequest))
  if (wait > 0) await new Promise(r => setTimeout(r, wait))
  lastRequest = Date.now()
}

export async function searchAddress(query: string): Promise<GeoResult[]> {
  if (!query.trim() || query.length < 3) return []
  await rateLimit()
  try {
    let url = `${NOMINATIM}/search?q=${encodeURIComponent(query)}&format=json&limit=6&countrycodes=bo&addressdetails=0`
    let res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (!res.ok) return []
    let data = await res.json() as Array<{ display_name: string; lat: string; lon: string }>

    if (data.length === 0) {
      await rateLimit()
      url = `${NOMINATIM}/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=0`
      res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
      if (!res.ok) return []
      data = await res.json() as Array<{ display_name: string; lat: string; lon: string }>
    }

    return data.map(d => ({
      displayName: d.display_name,
      lat: parseFloat(d.lat),
      lng: parseFloat(d.lon),
    }))
  } catch {
    return []
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  await rateLimit()
  try {
    const url = `${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (!res.ok) return null
    const data = await res.json() as { display_name?: string }
    return data.display_name ?? null
  } catch {
    return null
  }
}
