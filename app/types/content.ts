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

export interface ContentDoc {
  /** starter templates, each a full trip document */
  templates: Trip[]
  recs: PackRecItem[]
}
