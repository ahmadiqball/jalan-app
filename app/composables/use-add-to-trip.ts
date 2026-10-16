import type { Place } from '~/types/guide'

/** Opens the global "add a guide place to a trip" modal. */
export function useAddToTrip() {
  const place = useState<Place | null>('guide-add-place', () => null)
  const open = (p: Place) => { place.value = p }
  const close = () => { place.value = null }
  return { place, open, close }
}
