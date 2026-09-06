/**
 * Google Places Autocomplete (New), client-only. Lazily loads the Maps JS SDK
 * the first time it's needed and only when a public key is set. We keep just
 * the prediction's place_id + name, so this never fetches billable place
 * fields — autocomplete requests sit inside the free monthly tier, and a
 * session token groups the keystrokes of one lookup.
 *
 * No key => `enabled` is false and callers fall back to a plain text field.
 */
export interface PlacePrediction {
  placeId: string
  name: string
}

let mapsPromise: Promise<unknown> | null = null

function loadMaps(key: string): Promise<unknown> {
  if (mapsPromise) return mapsPromise
  mapsPromise = new Promise((resolve, reject) => {
    const w = window as unknown as Record<string, unknown>
    if ((w.google as { maps?: unknown } | undefined)?.maps) return resolve((w.google as { maps: unknown }).maps)
    const cb = '__jalanInitMaps'
    ;(w as Record<string, unknown>)[cb] = () => resolve((w.google as { maps: unknown }).maps)
    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&v=weekly&libraries=places&loading=async&callback=${cb}`
    s.async = true
    s.onerror = () => { mapsPromise = null; reject(new Error('Google Maps failed to load')) }
    document.head.appendChild(s)
  })
  return mapsPromise
}

export function usePlaces() {
  const key = computed(() => (useRuntimeConfig().public.googleMapsKey as string) || '')
  const enabled = computed(() => import.meta.client && !!key.value)

  async function places(): Promise<any> {
    const maps = (await loadMaps(key.value)) as { importLibrary: (n: string) => Promise<unknown> }
    return maps.importLibrary('places')
  }

  /** a fresh session token — reuse for one lookup, drop after a pick */
  async function newToken(): Promise<unknown> {
    const { AutocompleteSessionToken } = await places()
    return new AutocompleteSessionToken()
  }

  /** predictions for the current input; empty on any failure */
  async function suggest(input: string, token: unknown): Promise<PlacePrediction[]> {
    if (!input.trim()) return []
    try {
      const { AutocompleteSuggestion } = await places()
      const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        sessionToken: token,
      })
      return (suggestions || [])
        .map((s: any) => s.placePrediction)
        .filter(Boolean)
        .map((p: any) => ({ placeId: p.placeId as string, name: (p.text?.text || p.mainText?.text || '') as string }))
        .filter((p: PlacePrediction) => p.placeId && p.name)
    } catch {
      return []
    }
  }

  return { key, enabled, newToken, suggest }
}
