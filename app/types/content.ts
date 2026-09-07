import type { Trip } from '~/types/domain'

/** A template is a full trip document (status: 'template'). */
export type TemplateTrip = Trip

export interface PackRecItem {
  id: string
  label: string
  group: string
  req?: boolean
  url?: string
  mats?: string[]
  cats?: string[]
}

export interface ContentDoc {
  /** starter templates, each a full trip document */
  templates: Trip[]
  recs: PackRecItem[]
}
