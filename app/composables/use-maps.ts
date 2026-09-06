/**
 * Google Maps helpers, POC. Two free paths:
 *  - deep links (open in Maps): no key, no billing, no cost — always available.
 *  - Maps Embed API iframes: free & unlimited, but need a public key. When no
 *    key is set the embed URLs come back empty and the UI falls back to links.
 * `context` (e.g. the trip destination) is appended to each place for better
 * geocoding of short place names like "Pantai Kuta".
 */
export function useMaps() {
  const key = computed(() => (useRuntimeConfig().public.googleMapsKey as string) || '')
  const enabled = computed(() => !!key.value)

  const q = (place: string, context = '') =>
    encodeURIComponent([place, context].map((s) => s.trim()).filter(Boolean).join(', '))

  /** free deep link — opens the Maps app/site with a search */
  function searchUrl(place: string, context = ''): string {
    return `https://www.google.com/maps/search/?api=1&query=${q(place, context)}`
  }

  /** free deep link — opens the Maps app/site with a full route through the
   * given stops (all pins + directions). No key, no cost. */
  function directionsUrl(places: string[], context = ''): string {
    const pts = places.map((p) => p.trim()).filter(Boolean)
    if (pts.length < 2) return searchUrl(pts[0] || '', context)
    const origin = q(pts[0]!, context)
    const destination = q(pts[pts.length - 1]!, context)
    const mid = pts.slice(1, -1)
    const waypoints = mid.length ? `&waypoints=${mid.map((p) => q(p, context)).join('|')}` : ''
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints}`
  }

  /** free embed of a single place (empty when no key) */
  function placeEmbed(place: string, context = ''): string {
    return enabled.value && place.trim()
      ? `https://www.google.com/maps/embed/v1/place?key=${key.value}&q=${q(place, context)}`
      : ''
  }

  /** free embed of a route through 2+ places (empty when no key / too few) */
  function routeEmbed(places: string[], context = ''): string {
    const pts = places.map((p) => p.trim()).filter(Boolean)
    if (!enabled.value || pts.length < 2) return ''
    const origin = q(pts[0]!, context)
    const destination = q(pts[pts.length - 1]!, context)
    const mid = pts.slice(1, -1)
    const waypoints = mid.length ? `&waypoints=${mid.map((p) => q(p, context)).join('|')}` : ''
    return `https://www.google.com/maps/embed/v1/directions?key=${key.value}&origin=${origin}&destination=${destination}${waypoints}&mode=driving`
  }

  return { key, enabled, searchUrl, directionsUrl, placeEmbed, routeEmbed }
}
