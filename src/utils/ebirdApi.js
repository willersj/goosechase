const BASE = 'https://api.ebird.org/v2'

function authHeaders(apiKey) {
  return { 'X-eBirdApiToken': apiKey }
}

export async function getNearbyObservations(apiKey, lat, lng, distKm = 25, back = 7) {
  const params = new URLSearchParams({
    lat: lat.toFixed(6),
    lng: lng.toFixed(6),
    dist: Math.round(Math.min(distKm, 50)),
    back,
    maxResults: 10000,
    includeProvisional: true,
    hotspot: true,
    cat: 'species',
    fmt: 'json'
  })

  const res = await fetch(`${BASE}/data/obs/geo/recent?${params}`, {
    headers: authHeaders(apiKey)
  })

  if (res.status === 401) throw new Error('Invalid eBird API key. Check your key and try again.')
  if (res.status === 429) throw new Error('eBird rate limit hit. Please wait a moment and try again.')
  if (!res.ok) throw new Error(`eBird API error (${res.status}). Please try again.`)

  return res.json()
}

export async function getNearbyNotable(apiKey, lat, lng, distKm = 25, back = 7) {
  const params = new URLSearchParams({
    lat: lat.toFixed(6),
    lng: lng.toFixed(6),
    dist: Math.round(Math.min(distKm, 50)),
    back,
    hotspot: true,
    fmt: 'json'
  })

  const res = await fetch(`${BASE}/data/obs/geo/recent/notable?${params}`, {
    headers: authHeaders(apiKey)
  })

  if (res.status === 401) throw new Error('Invalid eBird API key. Check your key and try again.')
  if (res.status === 429) throw new Error('eBird rate limit hit. Please wait a moment and try again.')
  if (!res.ok) throw new Error(`eBird API error (${res.status}). Please try again.`)

  return res.json()
}

export async function getHotspotInfo(apiKey, locId) {
  try {
    const res = await fetch(`${BASE}/ref/hotspot/info/${locId}`, {
      headers: authHeaders(apiKey)
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export function parseHotspotLocation(hierarchicalName) {
  if (!hierarchicalName) return null
  const parts = hierarchicalName.split(', ')
  // Format: "HotspotName, County, State, Country" — drop first and last
  if (parts.length >= 3) return parts.slice(1, -1).join(', ')
  return null
}

export async function geocodeCity(query) {
  const params = new URLSearchParams({ q: query, format: 'json', limit: 1, 'accept-language': 'en' })
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`)
  if (!res.ok) throw new Error('Location search failed. Please try again.')
  const results = await res.json()
  if (!results.length) throw new Error(`No location found for "${query}". Try a more specific search.`)
  return {
    lat: parseFloat(results[0].lat),
    lng: parseFloat(results[0].lon),
    displayName: results[0].display_name
  }
}

export function hotspotUrl(locId) {
  return `https://ebird.org/hotspot/${locId}`
}

export function speciesEbirdUrl(speciesCode) {
  return `https://ebird.org/species/${speciesCode}`
}

export function speciesAllAboutBirdsUrl(comName) {
  return `https://www.allaboutbirds.org/guide/${comName.replace(/ /g, '_')}/`
}
