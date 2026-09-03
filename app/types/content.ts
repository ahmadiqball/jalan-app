export interface TemplateItem {
  id: string
  name: string
  sub: string
  mat: string
  days: number
  plan: number
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
