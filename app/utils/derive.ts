import type { Budget, Day, ExpenseLine, OutfitSet, Trip } from '~/types/domain'
import { CATEGORIES } from '~/types/domain'
import { addDays, longDate, shortDate, rp, shortRp } from '~/utils/format'
import { SEG_PALETTE, ofItems, ofText, tone } from '~/utils/categories'

/** Generate blank days from a start ISO date. */
export function buildDays(iso: string, len: number): Day[] {
  const out: Day[] = []
  for (let i = 0; i < len; i++) {
    const d = iso ? addDays(iso, i) : null
    out.push({
      date: d ? shortDate(d) : 'Hari ' + (i + 1),
      long: d ? longDate(d) : 'Hari ' + (i + 1),
      title: i === 0 ? 'Tiba' : i === len - 1 && len > 1 ? 'Pulang' : 'Belum diberi nama',
      outfit: '',
      acts: [],
    })
  }
  return out
}

/** Union of derived (activity cost) and manual expense lines. Never stored. */
export function expenseLines(trip: Trip): ExpenseLine[] {
  const out: ExpenseLine[] = []
  trip.days.forEach((d, di) =>
    d.acts.forEach((a) => {
      if (a.cost > 0)
        out.push({
          id: a.id,
          title: a.title,
          cat: a.cat === 'Santai' ? 'Lain' : a.cat,
          dayIdx: di,
          amount: a.cost,
          derived: true,
          time: a.time,
          dayLabel: d.date,
        })
    }),
  )
  ;(trip.manual || []).forEach((m) =>
    out.push({
      id: m.id,
      title: m.title,
      cat: m.cat,
      dayIdx: m.dayIdx,
      amount: m.amount,
      derived: false,
      time: '',
      dayLabel: (trip.days[m.dayIdx] || ({} as Day)).date || '',
    }),
  )
  return out
}

export function activeBudget(trip: Trip): Budget {
  const budgets = trip.budgets || []
  return (
    budgets.find((b) => b.id === trip.activeBudget) ||
    budgets[0] || { id: '', name: 'Rencana awal', note: '', alloc: {} }
  )
}

export interface BudgetSummary {
  activeB: Budget
  alloc: Record<string, number>
  allocTotal: number
  spent: number
  plan: number
  over: boolean
  pct: number
  statusFg: string
  statusBg: string
  statusCopy: string
  diff: number
  locked: boolean
  perPerson: number
}

export function budgetSummary(trip: Trip): BudgetSummary {
  const lines = expenseLines(trip)
  const activeB = activeBudget(trip)
  const alloc = activeB.alloc || {}
  const allocTotal = Object.values(alloc).reduce((n, v) => n + v, 0)
  const spent = lines.reduce((n, l) => n + l.amount, 0)
  const plan = allocTotal || trip.plan || 0
  const over = spent > plan
  const pct = plan ? (spent / plan) * 100 : 0
  const diff = Math.abs(spent - plan)
  const statusCopy = plan === 0 ? 'Rencana belum diisi' : over ? 'Lewat ' + shortRp(diff) : 'Sisa ' + shortRp(diff)
  return {
    activeB,
    alloc,
    allocTotal,
    spent,
    plan,
    over,
    pct,
    statusFg: over ? '#C85A28' : '#2F6B54',
    statusBg: over ? '#FCE3D3' : '#DEEEEC',
    statusCopy,
    diff,
    locked: trip.status === 'live',
    perPerson: trip.people ? spent / trip.people : spent,
  }
}

export interface CategoryRow {
  name: string
  spent: number
  spentRp: string
  spentShort: string
  allocRp: string
  alloc: number
  allocInput: string
  pct: number
  sharePct: number
  barColor: string
  spentFg: string
  leftCopy: string
  segColor: string
  iconBg: string
  iconFg: string
  canDelete: boolean
  lineCount: number
  lines: {
    title: string
    amountRp: string
    derived: boolean
    origin: string
  }[]
}

export function categoryRows(trip: Trip): CategoryRow[] {
  const lines = expenseLines(trip)
  const { alloc, spent, locked } = budgetSummary(trip)
  const catNames = Object.keys(alloc).length ? Object.keys(alloc) : [...CATEGORIES]
  return catNames.map((name, ci) => {
    const ls = lines.filter((l) => l.cat === name)
    const cs = ls.reduce((n, l) => n + l.amount, 0)
    const catAlloc = alloc[name] || 0
    const cpct = catAlloc ? Math.min(100, (cs / catAlloc) * 100) : cs ? 100 : 0
    const cover = cs > catAlloc && catAlloc > 0
    const [iconBg, iconFg] = tone(name)
    return {
      name,
      spent: cs,
      spentRp: rp(cs),
      spentShort: shortRp(cs),
      allocRp: rp(catAlloc),
      alloc: catAlloc,
      allocInput: catAlloc ? String(catAlloc) : '',
      pct: cpct,
      sharePct: spent ? Math.round((cs / spent) * 100) : 0,
      barColor: cover ? '#F0713A' : cpct >= 99 ? '#C4B29E' : cpct >= 80 ? '#D98F3B' : '#2F6B54',
      spentFg: cover ? '#C85A28' : '#10262B',
      leftCopy: catAlloc ? (cover ? 'lewat ' + shortRp(cs - catAlloc) : 'sisa ' + shortRp(catAlloc - cs)) : 'tanpa alokasi',
      segColor: SEG_PALETTE[ci % SEG_PALETTE.length]!,
      iconBg,
      iconFg,
      canDelete: !locked && cs === 0,
      lineCount: ls.length,
      lines: ls
        .slice()
        .sort((a, b) => b.amount - a.amount)
        .map((l) => ({
          title: l.title + (l.dayLabel ? ' · ' + l.dayLabel : ''),
          amountRp: rp(l.amount),
          derived: l.derived,
          origin: l.derived ? 'dari aktivitas' : 'dicatat sendiri',
        })),
    }
  })
}

/** conic-gradient stops for the donut, matching prototype. */
export function donutStops(trip: Trip): string {
  const rows = categoryRows(trip)
  const spent = rows.reduce((n, r) => n + r.spent, 0)
  const stops: string[] = []
  let acc = 0
  rows.forEach((c) => {
    const share = spent ? (c.spent / spent) * 100 : 0
    if (share <= 0) return
    stops.push(c.segColor + ' ' + acc.toFixed(1) + '% ' + (acc + share).toFixed(1) + '%')
    acc += share
  })
  if (acc < 100) stops.push('#F1EEE1 ' + acc.toFixed(1) + '% 100%')
  return stops.join(', ')
}

/** Categories referenced by expenses but not defined in the active version. */
export function looseCategories(trip: Trip): string[] {
  const { alloc } = budgetSummary(trip)
  const defined = new Set(Object.keys(alloc))
  const loose = new Set<string>()
  for (const l of expenseLines(trip)) {
    if (l.amount > 0 && !defined.has(l.cat)) loose.add(l.cat)
  }
  return [...loose]
}

/* ---- packing ---- */
export function packingProgress(trip: Trip) {
  const all = (trip.packing || []).flatMap((g) => g.items)
  const done = all.filter((i) => i.done).length
  const reqLeft = all.filter((i) => i.req && !i.done).length
  return { total: all.length, done, reqLeft }
}

/* ---- outfit resolution ---- */
export function outfitFind(trip: Trip, scope: string): OutfitSet | undefined {
  return (trip.outfitSets || []).find((x) => x.scope === scope)
}

/** Resolved outfit set for a day: own day set, else first activity set that has content. */
export function outfitDaySet(trip: Trip, i: number): OutfitSet | null {
  const dset = outfitFind(trip, 'day:' + i)
  if (ofText(dset)) return dset!
  return (
    ((trip.days[i] || { acts: [] }).acts || [])
      .map((a) => outfitFind(trip, 'act:' + a.id))
      .find((o) => ofText(o)) || null
  )
}

export function outfitDayText(trip: Trip, i: number): string {
  const dset = ofText(outfitFind(trip, 'day:' + i))
  if (dset) return dset
  const hit = ((trip.days[i] || { acts: [] }).acts || [])
    .map((a) => ofText(outfitFind(trip, 'act:' + a.id)))
    .find(Boolean)
  return hit || ''
}

/** Resolution rule for an activity: own set -> day set -> empty message. */
export function resolveActivityOutfit(trip: Trip, actId: string, dayIdx: number): string {
  return ofText(outfitFind(trip, 'act:' + actId)) || outfitDayText(trip, dayIdx) || 'Outfit hari ini belum diisi'
}

/** Options for the outfit scope picker: every day and every activity. */
export function scopeOptions(trip: Trip) {
  return trip.days.reduce<{ value: string; label: string; child: boolean }[]>((acc, d, i) => {
    acc.push({ value: 'day:' + i, label: 'Hari ' + (i + 1) + ' · ' + (d.title || d.date), child: false })
    ;(d.acts || [])
      .slice()
      .sort((a, b) => (a.time || '99').localeCompare(b.time || '99'))
      .forEach((a) => acc.push({ value: 'act:' + a.id, label: (a.time || '') + ' ' + a.title, child: true }))
    return acc
  }, [])
}

/* ---- overview warnings ("Perlu diperhatikan") ---- */
export function tripWarnings(trip: Trip): string[] {
  const out: string[] = []
  const { reqLeft } = packingProgress(trip)
  if (reqLeft > 0) out.push(reqLeft + ' barang wajib belum dicentang di Barang.')
  categoryRows(trip).forEach((r) => {
    if (r.alloc > 0 && r.spent > r.alloc) out.push('Kategori ' + r.name + ' sudah lewat anggaran (' + r.leftCopy + ').')
  })
  trip.days.forEach((d, i) => {
    if (d.acts.length === 0) out.push('Hari ' + (i + 1) + ' (' + d.date + ') belum ada aktivitas.')
  })
  return out
}
