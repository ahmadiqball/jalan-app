import type { OutfitSet } from '~/types/domain'

/** Category -> [bg, fg] tone, ported from prototype TONE map. */
export const TONE: Record<string, [string, string]> = {
  'Makan & minum': ['#F1EEE1', '#8A6314'],
  'Transport': ['#DEEEEC', '#0A4F55'],
  'Tiket & atraksi': ['#DEEEEC', '#2F6B54'],
  'Penginapan': ['#F1EEE1', '#6C7C7D'],
  'Lain': ['#FCE3D3', '#C85A28'],
  'Santai': ['#FCE3D3', '#C85A28'],
  'Tempat': ['#DEEEEC', '#2F6B54'],
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

/** Category -> Lucide icon class (presetIcons). */
export const CAT_ICON: Record<string, string> = {
  'Makan & minum': 'i-lucide-utensils',
  'Transport': 'i-lucide-bus',
  'Tiket & atraksi': 'i-lucide-ticket',
  'Penginapan': 'i-lucide-bed-double',
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
  'Lain': 'Lain',
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

/** Default cover photo for a motif — picking a category sets both as a set. */
export const MAT_COVER: Record<string, string> = {
  pantai: '/img/photo-sumba.jpg',
  sawah: '/img/photo-ubud.jpg',
  gunung: '/img/photo-bromo.jpg',
  kota: '/img/photo-kota.jpg',
}
export function coverForMat(mat: string): string {
  return MAT_COVER[mat] || ''
}
