/** Place-type metadata and helpers for the Guides module. */
export const PLACE_TYPES = [
  { id: 'hotel', label: 'Penginapan', icon: 'i-lucide-bed-double' },
  { id: 'makan', label: 'Makan & minum', icon: 'i-lucide-utensils' },
  { id: 'aktivitas', label: 'Aktivitas', icon: 'i-lucide-compass' },
  { id: 'hidden_gem', label: 'Hidden gem', icon: 'i-lucide-gem' },
] as const

const BY_ID = Object.fromEntries(PLACE_TYPES.map((t) => [t.id, t])) as Record<string, (typeof PLACE_TYPES)[number]>

export function placeTypeLabel(type: string): string {
  return BY_ID[type]?.label || type
}
export function placeTypeIcon(type: string): string {
  return BY_ID[type]?.icon || 'i-lucide-map-pin'
}

/** map a place type to the activity budget category used when adding to a trip */
export function placeTypeToCat(type: string): string {
  switch (type) {
    case 'hotel':
      return 'Penginapan'
    case 'makan':
      return 'Makan & minum'
    case 'aktivitas':
    case 'hidden_gem':
      return 'Tiket & atraksi'
    default:
      return 'Lain'
  }
}

