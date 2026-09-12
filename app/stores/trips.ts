import { defineStore } from 'pinia'
import type { Activity, Budget, ManualExpense, Member, PackItem, Trip } from '~/types/domain'
import { CATEGORIES } from '~/types/domain'
import { seedTrips } from '~/utils/seed'
import { buildDays } from '~/utils/derive'
import { addDays, shortDate, longDate } from '~/utils/format'
import { clientPersist } from '~/utils/persist'

/**
 * Domain store. Every trip edit goes through `patchTrip(id, fn)` which
 * deep-clones the trip, applies `fn`, and replaces it — immutable updates.
 * Persisted to localStorage.
 */
export const useTripsStore = defineStore(
  'trips',
  () => {
    const trips = ref<Trip[]>(seedTrips())
    const seq = ref(100)

    const byId = (id: string) => trips.value.find((t) => t.id === id)
    const liveTrip = computed(() => trips.value.find((t) => t.status === 'live'))
    /** real user trips (templates are edited in-store but never shown/synced as trips) */
    const userTrips = computed(() => trips.value.filter((t) => t.status !== 'template'))
    const templateTrips = computed(() => trips.value.filter((t) => t.status === 'template'))

    function nextId(prefix = ''): string {
      seq.value += 1
      return prefix + seq.value
    }

    /** immutable single-trip mutation */
    function patchTrip(id: string, fn: (t: Trip) => Trip): void {
      trips.value = trips.value.map((t) =>
        t.id === id ? fn(structuredClone(toRaw(t))) : t,
      )
    }

    /* ---- activity ---- */
    function setActivityField<K extends keyof Activity>(tripId: string, actId: string, field: K, value: Activity[K]) {
      patchTrip(tripId, (t) => {
        t.days.forEach((d) => d.acts.forEach((a) => { if (a.id === actId) a[field] = value }))
        return t
      })
    }
    function addActivity(tripId: string, dayIdx: number, a: Omit<Activity, 'id'>): string {
      const id = 'a' + nextId()
      patchTrip(tripId, (t) => {
        t.days[dayIdx]?.acts.push({ ...a, id })
        return t
      })
      return id
    }
    function deleteActivity(tripId: string, actId: string) {
      patchTrip(tripId, (t) => {
        t.days.forEach((d) => (d.acts = d.acts.filter((a) => a.id !== actId)))
        return t
      })
    }
    function setDayTitle(tripId: string, dayIdx: number, title: string) {
      patchTrip(tripId, (t) => { const d = t.days[dayIdx]; if (d) d.title = title; return t })
    }
    /** Remove a day (and its activities), keeping at least one. Re-derives the
     *  remaining days' date labels so they stay in order. */
    function removeDay(tripId: string, dayIdx: number) {
      patchTrip(tripId, (t) => {
        if (t.days.length <= 1) return t
        t.days.splice(dayIdx, 1)
        t.days.forEach((d, i) => {
          if (t.startIso) {
            const iso = addDays(t.startIso, i)
            d.date = shortDate(iso)
            d.long = longDate(iso)
          } else if (!d.date || /^Hari \d+$/.test(d.date)) {
            d.date = 'Hari ' + (i + 1)
            d.long = 'Hari ' + (i + 1)
          }
        })
        return t
      })
    }

    /* ---- budget ---- */
    // The category table shows the 5 default categories when a budget has no
    // allocations yet (phantom rows). The moment the user allocates or adds a
    // category those phantoms would vanish — so materialize them first, keeping
    // every visible category on the list.
    function ensureCats(b: Budget) {
      if (Object.keys(b.alloc).length === 0) for (const c of CATEGORIES) b.alloc[c] = 0
    }
    function setActiveBudget(tripId: string, budgetId: string) {
      patchTrip(tripId, (t) => { t.activeBudget = budgetId; return t })
    }
    function setAlloc(tripId: string, cat: string, amount: number) {
      patchTrip(tripId, (t) => {
        const b = t.budgets.find((x) => x.id === t.activeBudget) || t.budgets[0]
        if (b) { ensureCats(b); b.alloc[cat] = amount }
        return t
      })
    }
    function addCategory(tripId: string, name: string, amount: number, icon?: string) {
      patchTrip(tripId, (t) => {
        const b = t.budgets.find((x) => x.id === t.activeBudget) || t.budgets[0]
        if (b) { ensureCats(b); b.alloc[name] = amount }
        if (icon) { (t.catIcons ||= {})[name] = icon }
        return t
      })
    }
    function setCatIcon(tripId: string, name: string, icon: string) {
      patchTrip(tripId, (t) => { (t.catIcons ||= {})[name] = icon; return t })
    }
    function deleteCategory(tripId: string, name: string) {
      patchTrip(tripId, (t) => {
        const b = t.budgets.find((x) => x.id === t.activeBudget) || t.budgets[0]
        if (b) delete b.alloc[name]
        if (t.catIcons) delete t.catIcons[name]
        return t
      })
    }
    function addBudgetVersion(tripId: string): string {
      const id = 'b' + nextId()
      patchTrip(tripId, (t) => {
        const cur = t.budgets.find((x) => x.id === t.activeBudget) || t.budgets[0]
        t.budgets.push({ id, name: (cur?.name || 'Versi') + ' (salinan)', note: cur?.note || '', alloc: { ...(cur?.alloc || {}) } })
        t.activeBudget = id
        return t
      })
      return id
    }

    /* ---- manual expenses ---- */
    function addManual(tripId: string, m: Omit<ManualExpense, 'id'>): string {
      const id = 'm' + nextId()
      patchTrip(tripId, (t) => { t.manual.push({ ...m, id }); return t })
      return id
    }
    function deleteManual(tripId: string, id: string) {
      patchTrip(tripId, (t) => { t.manual = t.manual.filter((m) => m.id !== id); return t })
    }
    function updateManual(tripId: string, id: string, patch: Partial<ManualExpense>) {
      patchTrip(tripId, (t) => {
        const m = t.manual.find((x) => x.id === id)
        if (m) Object.assign(m, patch)
        return t
      })
    }

    /* ---- packing ---- */
    function togglePackItem(tripId: string, itemId: string) {
      patchTrip(tripId, (t) => {
        t.packing.forEach((g) => g.items.forEach((i) => { if (i.id === itemId) i.done = !i.done }))
        return t
      })
    }
    function addPackItem(tripId: string, group: string, item: Omit<PackItem, 'id'>) {
      const id = 'p' + nextId()
      patchTrip(tripId, (t) => {
        let g = t.packing.find((x) => x.name === group)
        if (!g) { g = { name: group, items: [] }; t.packing.push(g) }
        g.items.push({ ...item, id })
        return t
      })
    }

    /* ---- outfit ---- */
    // Target sets by id, not scope: with per-person outfits several sets can
    // share one scope (e.g. two "day:0" for different people), so a scope match
    // could edit the wrong card.
    function setOutfitSlot(tripId: string, setId: string, slot: 'top' | 'bottom' | 'shoes' | 'other', value: string) {
      patchTrip(tripId, (t) => {
        const set = t.outfitSets.find((x) => x.id === setId)
        if (set) set[slot] = value
        return t
      })
    }
    function setOutfitScope(tripId: string, setId: string, scope: string) {
      patchTrip(tripId, (t) => {
        const set = t.outfitSets.find((x) => x.id === setId)
        if (set) set.scope = scope
        return t
      })
    }
    function addOutfitSet(tripId: string, scope: string, base?: { top?: string; bottom?: string; shoes?: string; other?: string }, person?: string): string {
      const id = 'o' + nextId()
      patchTrip(tripId, (t) => {
        t.outfitSets.push({ id, scope, person, top: base?.top || '', bottom: base?.bottom || '', shoes: base?.shoes || '', other: base?.other || '' })
        return t
      })
      return id
    }
    function setOutfitPerson(tripId: string, setId: string, person: string | undefined) {
      patchTrip(tripId, (t) => {
        const set = t.outfitSets.find((x) => x.id === setId)
        if (set) set.person = person
        return t
      })
    }
    function removeOutfitScope(tripId: string, scope: string) {
      patchTrip(tripId, (t) => { t.outfitSets = t.outfitSets.filter((x) => x.scope !== scope); return t })
    }
    function removeOutfit(tripId: string, setId: string) {
      patchTrip(tripId, (t) => { t.outfitSets = t.outfitSets.filter((x) => x.id !== setId); return t })
    }

    /* ---- members ---- */
    function addMember(tripId: string, m: Omit<Member, 'id'>): string {
      const id = 'u' + nextId()
      patchTrip(tripId, (t) => {
        t.members.push({ ...m, id })
        t.people = Math.max(1, t.members.length)
        return t
      })
      return id
    }
    function removeMember(tripId: string, id: string) {
      patchTrip(tripId, (t) => {
        t.members = t.members.filter((m) => m.id !== id)
        t.people = Math.max(1, t.members.length)
        return t
      })
    }
    function setInviteRole(tripId: string, role: Member['role']) {
      patchTrip(tripId, (t) => { t.inviteRole = role; return t })
    }
    function setMemberRole(tripId: string, id: string, role: Member['role']) {
      patchTrip(tripId, (t) => {
        const m = t.members.find((x) => x.id === id)
        if (m) m.role = role
        return t
      })
    }

    /* ---- trip lifecycle ---- */
    function createTrip(
      input: Partial<Trip> & {
        name: string
        startIso?: string
        len?: number
        owner?: { name: string; email: string }
        /** starter budget allocation (e.g. from a template's anggaran) */
        alloc?: Record<string, number>
        /** starter packing list (e.g. from a template's barang) */
        packingSeed?: { label: string; group: string; req?: boolean }[]
      },
    ): string {
      const id = 't' + nextId()
      const len = input.len ?? (input.days?.length || 1)
      // group the packing seed by group name
      const packing: Trip['packing'] = []
      let pseq = 0
      for (const it of input.packingSeed || []) {
        let g = packing.find((x) => x.name === it.group)
        if (!g) { g = { name: it.group, items: [] }; packing.push(g) }
        g.items.push({ id: 'p' + id + ++pseq, label: it.label, req: !!it.req, done: false })
      }
      const alloc = input.alloc || {}
      const allocTotal = Object.values(alloc).reduce((n, v) => n + v, 0)
      const trip: Trip = {
        id,
        name: input.name,
        place: input.place || 'Belum ada destinasi',
        placeId: input.placeId,
        mat: input.mat || 'pantai',
        cover: input.cover || '',
        dates: input.dates || '',
        status: input.status ?? 'draft',
        people: input.people ?? 2,
        plan: input.plan ?? allocTotal,
        startIso: input.startIso,
        days: input.days ?? buildDays(input.startIso || '', len),
        activeBudget: id + '-awal',
        budgets: input.budgets ?? [{ id: id + '-awal', name: 'Rencana awal', note: '', alloc }],
        outfitSets: [],
        manual: [],
        packing: input.packing ?? packing,
        members:
          input.members ??
          (input.status === 'template'
            ? []
            : [
                input.owner
                  ? { id: 'u1', name: input.owner.name, email: input.owner.email, role: 'Pemilik', status: 'aktif' }
                  : { id: 'u1', name: 'Rina Kartika', email: 'rina@kelana.id', role: 'Pemilik', status: 'aktif' },
              ]),
      }
      trips.value = [...trips.value, trip]
      return id
    }

    /* ---- templates (admin-authored trip documents) ---- */
    /** blank template trip, edited via the normal trip tabs */
    function addTemplate(): string {
      return createTrip({ name: 'Template baru', place: '', status: 'template', len: 3, members: [] })
    }
    function deleteTemplate(id: string) {
      trips.value = trips.value.filter((t) => t.id !== id)
    }
    /** load admin content templates into the store (once), as editable template trips */
    function loadTemplates(list: Trip[]) {
      const others = trips.value.filter((t) => t.status !== 'template')
      const tpls = list.map((t) => ({ ...structuredClone(toRaw(t)), status: 'template' as const }))
      trips.value = [...others, ...tpls]
    }
    /** deep-copy a template (or any trip) into a fresh user trip */
    function cloneTrip(source: Trip, opts?: { owner?: { name: string; email: string } }): string {
      const id = 't' + nextId()
      const src = structuredClone(toRaw(source))
      const budgets = src.budgets.map((b, i) => ({ ...b, id: i === 0 ? id + '-awal' : id + '-b' + i }))
      const activeBudget = budgets[0]?.id || id + '-awal'
      const days = src.days.map((d) => ({
        ...d,
        acts: d.acts.map((a) => ({ ...a, paid: false })), // costs become plans again
      }))
      const packing = src.packing.map((g) => ({ ...g, items: g.items.map((it) => ({ ...it, done: false })) }))
      const trip: Trip = {
        ...src,
        id,
        status: 'draft',
        dates: '',
        startIso: undefined,
        splitBillId: undefined,
        splitMap: undefined,
        inviteRole: undefined,
        outfitSets: [],
        manual: [],
        days,
        budgets,
        activeBudget,
        packing,
        members: [
          opts?.owner
            ? { id: 'u1', name: opts.owner.name, email: opts.owner.email, role: 'Pemilik', status: 'aktif' }
            : { id: 'u1', name: 'Rina Kartika', email: 'rina@kelana.id', role: 'Pemilik', status: 'aktif' },
        ],
      }
      trips.value = [...trips.value, trip]
      return id
    }
    function updateTrip(id: string, patch: Partial<Trip>) {
      patchTrip(id, (t) => Object.assign(t, patch))
    }
    /** Delete a trip locally. In cloud mode the sync plugin observes the removal
     *  and issues the server DELETE. */
    function deleteTrip(id: string) {
      trips.value = trips.value.filter((t) => t.id !== id)
    }
    function setSplitBill(id: string, billId: string) {
      patchTrip(id, (t) => { t.splitBillId = billId; if (!billId) t.splitMap = {}; return t })
    }
    function setSplitMap(id: string, map: Record<string, string>) {
      patchTrip(id, (t) => { t.splitMap = map; return t })
    }

    function resetSeed() {
      trips.value = seedTrips()
      seq.value = 100
    }
    /** Replace all trips (used by cloud sync on pull). Strips server meta,
     *  preserves in-store templates (they live in global content, not user trips). */
    function replaceAll(list: Trip[]) {
      const templates = trips.value.filter((t) => t.status === 'template')
      const incoming = list.map((t) => {
        const { _v, _shareId, ...rest } = t as Trip & { _v?: number; _shareId?: string }
        return rest as Trip
      })
      trips.value = [...templates, ...incoming]
    }

    return {
      trips, seq, byId, liveTrip, userTrips, templateTrips, patchTrip, nextId,
      setActivityField, addActivity, deleteActivity, setDayTitle, removeDay,
      setActiveBudget, setAlloc, addCategory, deleteCategory, setCatIcon, addBudgetVersion,
      addManual, deleteManual, updateManual,
      togglePackItem, addPackItem,
      setOutfitSlot, setOutfitScope, addOutfitSet, removeOutfitScope, removeOutfit, setOutfitPerson,
      addMember, removeMember, setMemberRole, setInviteRole,
      createTrip, updateTrip, deleteTrip, setSplitBill, setSplitMap, resetSeed, replaceAll,
      addTemplate, deleteTemplate, loadTemplates, cloneTrip,
    }
  },
  { persist: { storage: clientPersist } },
)
