export interface TemplatePackItem {
  label: string
  group: string
  req?: boolean
}

export interface TemplateItem {
  id: string
  name: string
  sub: string
  mat: string
  /** cover image path (admin-editable placeholder); '' = motif art only */
  cover?: string
  days: number
  plan: number
  /** anggaran per category — the template's starter budget allocation */
  alloc?: Record<string, number>
  /** barang — the template's starter packing list */
  packing?: TemplatePackItem[]
}

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
  templates: TemplateItem[]
  recs: PackRecItem[]
}
