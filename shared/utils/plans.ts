/** Subscription plans and the limit rules shared by the server and the app. */
export type PlanId = 'lite' | 'plus' | 'premium'
export type BillingPeriod = '1m' | '3m' | '12m'

export interface Plan {
  id: PlanId
  name: string
  rank: number
  maxTrips: number
  maxMembers: number
  /** null = unlimited */
  maxBudgetVersions: number | null
  guides: boolean
  newsletter: boolean
  prices: Record<BillingPeriod, number>
}

export const PLANS: Record<PlanId, Plan> = {
  lite: { id: 'lite', name: 'Kelana Lite', rank: 1, maxTrips: 1, maxMembers: 2, maxBudgetVersions: 1, guides: false, newsletter: false, prices: { '1m': 20000, '3m': 54000, '12m': 149000 } },
  plus: { id: 'plus', name: 'Kelana Plus', rank: 2, maxTrips: 3, maxMembers: 6, maxBudgetVersions: null, guides: true, newsletter: true, prices: { '1m': 34000, '3m': 89000, '12m': 249000 } },
  premium: { id: 'premium', name: 'Kelana Premium', rank: 3, maxTrips: 5, maxMembers: 20, maxBudgetVersions: null, guides: true, newsletter: true, prices: { '1m': 59000, '3m': 149000, '12m': 449000 } },
}
export const PLAN_LIST = [PLANS.lite, PLANS.plus, PLANS.premium]
export const PERIOD_MONTHS: Record<BillingPeriod, number> = { '1m': 1, '3m': 3, '12m': 12 }
export const PERIOD_LABELS: Record<BillingPeriod, string> = { '1m': '1 bulan', '3m': '3 bulan', '12m': '1 tahun' }

export function isPlanId(v: unknown): v is PlanId {
  return typeof v === 'string' && v in PLANS
}
export function isBillingPeriod(v: unknown): v is BillingPeriod {
  return typeof v === 'string' && v in PERIOD_MONTHS
}

export interface Subscription {
  plan: PlanId
  expiresAt: string
}

export interface Entitlement {
  /** unlimited = admins and local mode; none = no paid plan right now */
  status: 'unlimited' | 'active' | 'none'
  plan: PlanId | null
  expiresAt: string | null
  /** null = unlimited */
  maxTrips: number | null
  maxMembers: number | null
  maxBudgetVersions: number | null
  guides: boolean
}

export const UNLIMITED: Entitlement = { status: 'unlimited', plan: null, expiresAt: null, maxTrips: null, maxMembers: null, maxBudgetVersions: null, guides: true }
export const NO_PLAN: Entitlement = { status: 'none', plan: null, expiresAt: null, maxTrips: 0, maxMembers: 0, maxBudgetVersions: 0, guides: false }

export function entitlementOf(sub: Subscription | null, now = new Date()): Entitlement {
  if (!sub || new Date(sub.expiresAt) <= now) return NO_PLAN
  const p = PLANS[sub.plan]
  return { status: 'active', plan: p.id, expiresAt: sub.expiresAt, maxTrips: p.maxTrips, maxMembers: p.maxMembers, maxBudgetVersions: p.maxBudgetVersions, guides: p.guides }
}

/** Calendar months from `from`; a day that doesn't exist lands on the month's last day. */
export function addMonths(from: Date, months: number): Date {
  const d = new Date(from)
  const day = d.getUTCDate()
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() + months)
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
  d.setUTCDate(Math.min(day, last))
  return d
}

export interface TripShape {
  id?: string
  status?: string
  startIso?: string
  days?: unknown[]
  members?: unknown[]
  budgets?: unknown[]
}

/** A trip uses a slot until its last day has passed; undated trips always do. */
export function isTripActive(t: TripShape, now = new Date()): boolean {
  if (t.status === 'template') return false
  if (!t.startIso) return true
  const end = new Date(t.startIso + 'T23:59:59')
  end.setDate(end.getDate() + Math.max(0, (t.days?.length || 1) - 1))
  return end >= now
}

export const memberCount = (t: TripShape) => t.members?.length || 0
export const budgetCount = (t: TripShape) => t.budgets?.length || 0

/**
 * Trips the owner can't edit under this entitlement. With no plan, all of them.
 * Over a limit (after a downgrade), the most recently updated active trips that
 * fit stay editable; ended trips don't use a slot.
 */
export function lockedTripIds(rows: { id: string; updatedAt: string; data: TripShape }[], ent: Entitlement, now = new Date()): string[] {
  if (ent.status === 'unlimited') return []
  if (ent.status === 'none') return rows.map((r) => r.id)
  const active = rows
    .filter((r) => isTripActive(r.data, now))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const locked: string[] = []
  let used = 0
  for (const r of active) {
    if (used < ent.maxTrips! && memberCount(r.data) <= ent.maxMembers!) used++
    else locked.push(r.id)
  }
  return locked
}

/** Why this write breaks the plan, or null. `prev` is null for a new trip. */
export function tripWriteViolation(
  ent: Entitlement,
  prev: TripShape | null,
  next: TripShape,
  ctx: { activeOwned: number; locked: boolean },
): string | null {
  if (ent.status === 'unlimited') return null
  if (ent.status === 'none') return 'Butuh paket aktif untuk mengubah trip ini'
  if (ctx.locked) return 'Trip ini melebihi batas paket pemiliknya'
  const opensSlot = isTripActive(next) && (!prev || !isTripActive(prev))
  if (opensSlot && ctx.activeOwned >= ent.maxTrips!) return `Paket ini hanya untuk ${ent.maxTrips} trip aktif`
  if (memberCount(next) > ent.maxMembers! && memberCount(next) > (prev ? memberCount(prev) : 0)) return `Paket ini maksimal ${ent.maxMembers} anggota per trip`
  if (ent.maxBudgetVersions != null && budgetCount(next) > ent.maxBudgetVersions && budgetCount(next) > (prev ? budgetCount(prev) : 0)) return 'Versi anggaran tambahan butuh Kelana Plus'
  return null
}
