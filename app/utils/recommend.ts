import type { RecPlace, RecRegion, RecPlaceType } from '~/types/content'
import { REC_TYPES } from '~/types/content'
import type { Trip } from '~/types/domain'

/** Resolve a trip to its recommendation region: manual override first, then a
 *  fuzzy contains-match of the destination text against each region's aliases. */
export function regionOf(
  trip: Pick<Trip, 'place' | 'region'>,
  regions: RecRegion[],
): RecRegion | null {
  if (trip.region) {
    const pinned = regions.find((r) => r.id === trip.region)
    if (pinned) return pinned
  }
  const hay = (trip.place || '').toLowerCase()
  if (!hay.trim()) return null
  for (const r of regions) {
    if (r.aliases.some((a) => a && hay.includes(a.toLowerCase()))) return r
  }
  return null
}

/** Curated places for a trip's resolved region, newest curation first-ish. */
export function placesForTrip(
  trip: Pick<Trip, 'place' | 'region'>,
  regions: RecRegion[],
  places: RecPlace[],
): RecPlace[] {
  const r = regionOf(trip, regions)
  if (!r) return []
  return places.filter((p) => p.region === r.id)
}

const TYPE_META = Object.fromEntries(REC_TYPES.map((t) => [t.id, t])) as Record<
  string,
  (typeof REC_TYPES)[number]
>

export function recTypeLabel(type: string): string {
  return TYPE_META[type]?.label || type
}
export function recTypeIcon(type: string): string {
  return TYPE_META[type]?.icon || 'i-lucide-map-pin'
}

/** map a recommendation type to an activity budget category, for "add to trip" */
export function recTypeToCat(type: RecPlaceType | string): string {
  switch (type) {
    case 'resto':
    case 'cafe':
      return 'Makan & minum'
    case 'hotel':
      return 'Penginapan'
    case 'wisata':
    case 'aktivitas':
      return 'Tiket & atraksi'
    default:
      return 'Lain'
  }
}
