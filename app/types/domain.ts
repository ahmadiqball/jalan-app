// Domain model for Kelana. Ported from the prototype state shape.

/** Budget categories that carry an allocation line. */
export const CATEGORIES = [
  'Makan & minum',
  'Transport',
  'Tiket & atraksi',
  'Penginapan',
  'Lain',
] as const
export type Category = (typeof CATEGORIES)[number]

/** Activity categories include the budget categories plus "Santai" (maps to Lain). */
export type ActivityCategory = Category | 'Santai' | 'Tempat'

export type TripStatus = 'live' | 'plan' | 'draft' | 'template'

/** Category keys drive the cover art / photo. */
export type MotifKey =
  | 'pantai'
  | 'gunung'
  | 'alam'
  | 'budaya'
  | 'kota'
  | 'kuliner'
  | 'pulau'
  | 'lainnya'

export interface Activity {
  id: string
  /** "HH.MM" (dot separator) or "" */
  time: string
  /** duration in minutes */
  dur: number
  title: string
  cat: string
  /** display name of the place (from Google autocomplete, or free text) */
  place: string
  /** Google place_id when the place was picked from autocomplete; enables
   *  accurate map pins/links. Absent for free-text or unset locations. */
  placeId?: string
  cost: number
  note: string
  /** member ids who join this activity; undefined = everyone */
  participants?: string[]
  /** true once the cost has actually been spent — only then is it an expense.
   *  Until then the cost is just a plan and does not count as "terpakai". */
  paid?: boolean
}

export interface Day {
  /** short label e.g. "Sen, 14 Sep" */
  date: string
  /** long label e.g. "Senin, 14 September" */
  long: string
  title: string
  /** free-text legacy outfit note (kept for parity; outfitSets is canonical) */
  outfit: string
  acts: Activity[]
}

export interface Budget {
  id: string
  name: string
  note: string
  /** per-category rupiah allocation */
  alloc: Record<string, number>
}

/** scope: "day:<index>" | "act:<id>" */
export interface OutfitSet {
  id: string
  scope: string
  /** member id this set is for; undefined = shared / everyone */
  person?: string
  top: string
  bottom: string
  shoes: string
  other: string
}

export interface ManualExpense {
  id: string
  title: string
  cat: string
  dayIdx: number
  amount: number
  note: string
}

export interface PackItem {
  id: string
  label: string
  req: boolean
  done: boolean
  url?: string
}

export interface PackGroup {
  name: string
  items: PackItem[]
}

export type MemberRole = 'Pemilik' | 'Bisa ubah' | 'Hanya lihat'
export type MemberStatus = 'aktif' | 'menunggu'

export interface Member {
  id: string
  name: string
  email: string
  role: MemberRole
  status: MemberStatus
}

export interface Trip {
  id: string
  name: string
  place: string
  /** Google place_id for the destination (from autocomplete); exact map pin */
  placeId?: string
  /** motif key */
  mat: string
  /** cover image path, may be "" */
  cover: string
  /** display range string e.g. "12–15 Sep" */
  dates: string
  status: TripStatus
  people: number
  /** legacy flat plan figure; allocation total supersedes it when present */
  plan: number
  /** ISO start date, used to regenerate day labels */
  startIso?: string
  /** pete-pete bill id created for splitting this trip's expenses (handoff) */
  splitBillId?: string
  /** sync ledger: jalan expense-line id -> the pete-pete entry id it maps to.
   *  Lets re-syncs reconcile (update/delete) only jalan-managed entries and
   *  leave anything added directly in pete-pete untouched. */
  splitMap?: Record<string, string>
  /** role granted to anyone who opens the invite link (owner-controlled, so a
   *  view link can't be escalated to edit by editing the URL) */
  inviteRole?: MemberRole
  /** per-category custom icon (lucide class), overrides the default map */
  catIcons?: Record<string, string>
  days: Day[]
  activeBudget: string
  budgets: Budget[]
  outfitSets: OutfitSet[]
  manual: ManualExpense[]
  packing: PackGroup[]
  members: Member[]
}

/** A computed expense line (derived from an activity cost, or a manual entry). */
export interface ExpenseLine {
  id: string
  title: string
  cat: string
  dayIdx: number
  amount: number
  derived: boolean
  time: string
  dayLabel: string
}
