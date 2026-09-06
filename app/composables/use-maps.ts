/**
 * Google Maps link/embed helpers, POC. Two free paths:
 *  - deep links (open in Maps): no key, no billing, no cost — always available.
 *  - Maps Embed API iframes: free & unlimited, but need a public key.
 * When a stop carries a Google `placeId` (picked from autocomplete) it's used
 * for an exact pin; otherwise the name text is geocoded, with `context` (the
 * trip destination) appended to disambiguate short names like "Pantai Kuta".
 */
export interface MapStop {
  name: string
  placeId?: string
}

export function useMaps() {
  const key = computed(() => (useRuntimeConfig().public.googleMapsKey as string) || '')
  const enabled = computed(() => !!key.value)

  const q = (place: string, context = '') =>
    encodeURIComponent([place, context].map((s) => s.trim()).filter(Boolean).join(', '))
  const has = (s: MapStop) => !!(s.placeId || s.name?.trim())
  /** embed `q` value: exact place_id when available, else geocoded text */
  const embedQ = (s: MapStop, context: string) => (s.placeId ? `place_id:${s.placeId}` : q(s.name, context))

  /** free deep link — opens the Maps app/site at one place */
  function searchUrl(s: MapStop, context = ''): string {
    const base = `https://www.google.com/maps/search/?api=1&query=${q(s.name, context)}`
    return s.placeId ? `${base}&query_place_id=${s.placeId}` : base
  }

  /** free deep link — opens a full route through the stops (all pins + directions) */
  function directionsUrl(stops: MapStop[], context = ''): string {
    const pts = stops.filter(has)
    if (pts.length < 2) return searchUrl(pts[0] || { name: '' }, context)
    const first = pts[0]!
    const last = pts[pts.length - 1]!
    const mid = pts.slice(1, -1)
    let url = `https://www.google.com/maps/dir/?api=1&origin=${q(first.name, context)}&destination=${q(last.name, context)}`
    if (first.placeId) url += `&origin_place_id=${first.placeId}`
    if (last.placeId) url += `&destination_place_id=${last.placeId}`
    if (mid.length) {
      url += `&waypoints=${mid.map((m) => q(m.name, context)).join('|')}`
      if (mid.every((m) => m.placeId)) url += `&waypoint_place_ids=${mid.map((m) => m.placeId).join('|')}`
    }
    return url
  }

  /** free embed of a single place (empty when no key) */
  function placeEmbed(s: MapStop, context = ''): string {
    return enabled.value && has(s)
      ? `https://www.google.com/maps/embed/v1/place?key=${key.value}&q=${embedQ(s, context)}`
      : ''
  }

  /** free embed of a route through 2+ stops (empty when no key / too few) */
  function routeEmbed(stops: MapStop[], context = ''): string {
    const pts = stops.filter(has)
    if (!enabled.value || pts.length < 2) return ''
    const origin = embedQ(pts[0]!, context)
    const destination = embedQ(pts[pts.length - 1]!, context)
    const mid = pts.slice(1, -1)
    const waypoints = mid.length ? `&waypoints=${mid.map((m) => embedQ(m, context)).join('|')}` : ''
    return `https://www.google.com/maps/embed/v1/directions?key=${key.value}&origin=${origin}&destination=${destination}${waypoints}&mode=driving`
  }

  return { key, enabled, searchUrl, directionsUrl, placeEmbed, routeEmbed }
}
