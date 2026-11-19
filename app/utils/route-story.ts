import type { Trip } from '~/types/domain'

/** "Sumba 4 Hari!" -> "sumba-4-hari" */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)
}

/** the URL part of a route's story page: its slug, else its id */
export function routeSlug(tp: Trip): string {
  return tp.story?.slug || tp.id
}

/** find a route by slug or id */
export function findRoute(list: Trip[], key: string): Trip | null {
  return list.find((t) => t.story?.slug === key) || list.find((t) => t.id === key) || null
}

/** a free slug for `name`, not used by any other route */
export function uniqueSlug(name: string, id: string, list: Trip[]): string {
  const base = slugify(name) || id
  const taken = new Set(list.filter((t) => t.id !== id).map(routeSlug))
  let s = base
  for (let i = 2; taken.has(s); i++) s = `${base}-${i}`
  return s
}

/**
 * Budget-share colours, one per category in a FIXED order so a colour always
 * sits beside the same neighbours in the stacked bar. Checked with the dataviz
 * validator on #FBFAF5 (light band, chroma floor, CVD and normal-vision
 * separation pass; amber is under 3:1, so labels are always visible).
 * Anything else folds into "Lain" (neutral grey, the usual "Other").
 */
export const BUDGET_SHARE: { cat: string; color: string }[] = [
  { cat: 'Penginapan', color: '#00909A' },
  { cat: 'Transport', color: '#CF5A2E' },
  { cat: 'Makan & minum', color: '#E0A21A' },
  { cat: 'Tiket & atraksi', color: '#3E6FC8' },
  { cat: 'Belanja', color: '#B5508F' },
  { cat: 'Lain', color: '#8C9493' },
]

export interface BudgetShare { cat: string; color: string; amount: number; share: number }

/** the route's planned budget by category, in the fixed share order */
export function routeBudget(tp: Trip): BudgetShare[] {
  const b = tp.budgets?.find((x) => x.id === tp.activeBudget) || tp.budgets?.[0]
  const sums = new Map<string, number>()
  for (const [cat, v] of Object.entries(b?.alloc || {})) {
    if (!(v > 0)) continue
    const key = BUDGET_SHARE.some((s) => s.cat === cat) ? cat : 'Lain'
    sums.set(key, (sums.get(key) || 0) + v)
  }
  const total = [...sums.values()].reduce((n, v) => n + v, 0) || 1
  return BUDGET_SHARE.filter((s) => sums.has(s.cat)).map((s) => ({ ...s, amount: sums.get(s.cat)!, share: sums.get(s.cat)! / total }))
}

export function routeTotal(tp: Trip): number {
  return routeBudget(tp).reduce((n, r) => n + r.amount, 0) || tp.plan || 0
}

/** cost per person, the figure readers compare */
export function routePerPerson(tp: Trip): number {
  return Math.round(routeTotal(tp) / Math.max(1, tp.people || 1))
}

/** "5 hari 4 malam" */
export function routeLength(tp: Trip): string {
  const d = tp.days.length
  return d > 1 ? `${d} hari ${d - 1} malam` : `${d} hari`
}

export const DEFAULT_BUDGET_NOTE = 'Belum termasuk tiket pesawat.'
