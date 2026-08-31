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

/** Segment palette for the budget donut / category dots. */
export const SEG_PALETTE = [
  '#F0713A', '#0E6E76', '#D98F3B', '#2F6B54',
  '#C4B29E', '#8FC2BE', '#C85A28', '#8A6314',
]

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
