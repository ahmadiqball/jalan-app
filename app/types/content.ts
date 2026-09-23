import type { Trip } from '~/types/domain'

/** A template is a full trip document (status: 'template'). */
export type TemplateTrip = Trip

export interface PackRecItem {
  id: string
  label: string
  /** barang groups this item belongs to (multiselect) */
  groups: string[]
  req?: boolean
  url?: string
  /** limit to these trip motifs (empty = all) */
  mats?: string[]
  /** surface when the trip has activities in these categories (empty = any) */
  cats?: string[]
}

/** Types of curated recommendation. */
export const REC_TYPES = [
  { id: 'resto', label: 'Restoran', icon: 'i-lucide-utensils' },
  { id: 'cafe', label: 'Kafe', icon: 'i-lucide-coffee' },
  { id: 'hotel', label: 'Penginapan', icon: 'i-lucide-bed-double' },
  { id: 'wisata', label: 'Wisata', icon: 'i-lucide-camera' },
  { id: 'aktivitas', label: 'Aktivitas', icon: 'i-lucide-compass' },
] as const
export type RecPlaceType = (typeof REC_TYPES)[number]['id']

/** A destination bucket. `aliases` are lowercase fragments matched against a
 *  trip's free-text place so "Villa di Ubud" resolves to region "bali". */
export interface RecRegion {
  id: string
  label: string
  aliases: string[]
}

/** A curated place shown on trips whose destination resolves to `region`. */
export interface RecPlace {
  id: string
  name: string
  type: RecPlaceType
  region: string
  area?: string
  priceLevel?: number
  note?: string
  url?: string
  image?: string
}

export interface ContentDoc {
  /** starter templates, each a full trip document */
  templates: Trip[]
  recs: PackRecItem[]
  /** destination buckets used to match recommendations to a trip */
  regions?: RecRegion[]
  /** curated recommendation list (resto, cafe, hotel, …) */
  places?: RecPlace[]
}
