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


/**
 * Best-effort rupiah amount from a curated price label, used to prefill the
 * activity cost (the user can still edit it). Ranges take the lower bound.
 *   "Rp 750.000 / malam" → 750000 · "Rp 80–150 rb/orang" → 80000 · "Rp 1,5 jt" → 1500000
 */
export function parsePriceText(text?: string): number {
  if (!text) return 0
  const m = text.match(/(\d[\d.,]*)\s*(?:[–-]\s*\d[\d.,]*\s*)?(rb|ribu|k|jt|juta)?\b/i)
  if (!m) return 0
  const unit = (m[2] || '').toLowerCase()
  if (!unit) return Number(m[1]!.replace(/\D/g, '')) || 0
  const n = Number.parseFloat(m[1]!.replace(',', '.'))
  if (!Number.isFinite(n)) return 0
  return Math.round(n * (unit === 'jt' || unit === 'juta' ? 1_000_000 : 1_000))
}
