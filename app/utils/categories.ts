import type { Category, OutfitSet } from '~/types/domain'

/** Category -> [bg, fg] tone, ported from prototype TONE map. */
export const TONE: Record<string, [string, string]> = {
  'Makan & minum': ['#F1EEE1', '#8A6314'],
  'Transport': ['#DEEEEC', '#0A4F55'],
  'Tiket & atraksi': ['#DEEEEC', '#2F6B54'],
  'Penginapan': ['#F1EEE1', '#6C7C7D'],
  'Belanja': ['#EDE6F1', '#6A4C93'],
  'Lain': ['#FCE3D3', '#C85A28'],
  'Santai': ['#FCE3D3', '#C85A28'],
  'Tempat': ['#DEEEEC', '#2F6B54'],
}

/**
 * Display label for a category key. The stored key stays stable ("Lain") so
 * existing budget allocations keep matching; only the shown text changes.
 */
export const CAT_LABEL: Record<string, string> = { 'Lain': 'Lainnya' }
export function catLabel(name: string): string {
  return CAT_LABEL[name] || name
}

const PALETTE_TONE: [string, string][] = [
  ['#DEEEEC', '#0A4F55'],
  ['#DEEEEC', '#2F6B54'],
  ['#F1EEE1', '#8A6314'],
  ['#FCE3D3', '#C85A28'],
  ['#F1EEE1', '#6C7C7D'],
]

/** deterministic tone for an unknown category name */
export function tone(name: string): [string, string] {
  if (TONE[name]) return TONE[name]!
  let n = 0
  for (const ch of name) n += ch.charCodeAt(0)
  return PALETTE_TONE[n % PALETTE_TONE.length]!
}

/**
 * Which budget line an activity category spends against. Budget categories map
 * to themselves; the "activity-only" categories (Santai, Tempat) fold into a
 * real budget line so a paid activity's cost is always represented in the
 * budget breakdown — otherwise its spend counts in the total but appears in no
 * category row, and the donut/rows stop summing to the total.
 */
export const ACT_CAT_BUDGET: Record<string, Category> = {
  'Santai': 'Lain',
  'Tempat': 'Tiket & atraksi',
}
export function budgetCatOf(cat: string): string {
  return ACT_CAT_BUDGET[cat] || cat
}

/** Category -> Lucide icon class (presetIcons). */
export const CAT_ICON: Record<string, string> = {
  'Makan & minum': 'i-lucide-utensils',
  'Transport': 'i-lucide-bus',
  'Tiket & atraksi': 'i-lucide-ticket',
  'Penginapan': 'i-lucide-bed-double',
  'Belanja': 'i-lucide-shopping-bag',
  'Lain': 'i-lucide-ellipsis',
  'Santai': 'i-lucide-sun',
  'Tempat': 'i-lucide-map-pin',
}

export function iconFor(name: string): string {
  return CAT_ICON[name] || CAT_ICON.Lain!
}

/** Curated lucide icons offered when changing a category's icon. */
export const ICON_CHOICES = [
  'i-lucide-utensils', 'i-lucide-coffee', 'i-lucide-bus', 'i-lucide-car',
  'i-lucide-plane', 'i-lucide-ticket', 'i-lucide-bed-double', 'i-lucide-map-pin',
  'i-lucide-shopping-bag', 'i-lucide-gift', 'i-lucide-camera', 'i-lucide-waves',
  'i-lucide-mountain', 'i-lucide-sun', 'i-lucide-wine', 'i-lucide-ellipsis',
]

/** Icon for a category, honoring the trip's custom override. */
export function catIcon(icons: Record<string, string> | undefined, name: string): string {
  return icons?.[name] || iconFor(name)
}

/** DOM-id-safe slug for a category name (deep-linking to a budget row). */
export function catSlug(name: string): string {
  return 'bcat-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/**
 * Segment palette for the budget donut / category identity dots.
 * Deliberately COOL/NEUTRAL only — no green/amber/red — so it never collides
 * with the usage-bar state colors (green ok / amber near / red over).
 */
export const SEG_PALETTE = [
  '#0E6E76', '#0A4F55', '#8FC2BE', '#C8E2DE',
  '#C4B29E', '#8A6314', '#33474C', '#D8D0BB',
]

/** Usage-bar fill by fill-state — distinct from SEG_PALETTE. */
export const BAR_OK = '#2F6B54'
export const BAR_NEAR = '#D98F3B'
export const BAR_OVER = '#C85A28'

export const SHORT_CAT: Record<string, string> = {
  'Makan & minum': 'Makan',
  'Transport': 'Transport',
  'Tiket & atraksi': 'Tiket',
  'Belanja': 'Belanja',
  'Lain': 'Lainnya',
}

export const ROLES = ['Pemilik', 'Bisa ubah', 'Hanya lihat'] as const

/** Outfit slots: [key, label, placeholder-example, lucide-icon]. */
export const OF_SLOTS: [keyof Pick<OutfitSet, 'top' | 'bottom' | 'shoes' | 'other'>, string, string, string][] = [
  ['top', 'Atasan', 'kaos linen putih', 'i-lucide-shirt'],
  ['bottom', 'Bawahan', 'celana cepat kering', 'i-lucide-rectangle-vertical'],
  ['shoes', 'Alas kaki', 'sandal gunung', 'i-lucide-footprints'],
  ['other', 'Lainnya', 'topi lebar, dry bag', 'i-lucide-backpack'],
]

/** "kaos · celana · sandal" summary of a set, empty slots dropped */
export function ofText(o: OutfitSet | null | undefined): string {
  if (!o) return ''
  return OF_SLOTS.map(([k]) => (o[k] || '').trim())
    .filter(Boolean)
    .join(' · ')
}

export function ofItems(o: OutfitSet | null | undefined) {
  return OF_SLOTS.map(([k, label, , icon]) => ({
    label,
    icon,
    value: ((o && o[k]) || '').trim(),
  })).filter((x) => x.value)
}

/** Cover choices offered in edit / new-trip forms. */
export const COVERS: [string, string][] = [
  ['/img/photo-sumba.jpg', 'Pantai'],
  ['/img/photo-ubud.jpg', 'Sawah'],
  ['/img/photo-bromo.jpg', 'Gunung'],
  ['/img/photo-kota.jpg', 'Kota'],
]

/**
 * Default cover photo per category. Picking a category sets its cover too.
 * Categories without a photo here fall back to the motif illustration
 * ("lainnya" / Other stays as motif art).
 */
export const MAT_COVER: Record<string, string> = {
  pantai: '/img/photo-sumba.jpg',
  gunung: '/img/photo-bromo.jpg',
  alam: '/img/photo-ubud.jpg',
  kota: '/img/cat-city.webp',
  budaya: '/img/cat-culture.jpg',
  kuliner: '/img/cat-culinary.jpg',
  pulau: '/img/cat-island.avif',
}
export function coverForMat(mat: string): string {
  return MAT_COVER[mat] || ''
}

/** A trip's cover, falling back to its category's default photo when unset. */
export function tripCover(trip: { cover?: string; mat: string }): string {
  return trip.cover || coverForMat(trip.mat)
}
