import { defineStore } from 'pinia'
import type { Activity, ManualExpense, Member, PackItem, Trip } from '~/types/domain'
import { seedTrips } from '~/utils/seed'
import { buildDays } from '~/utils/derive'

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

    /* ---- budget ---- */
    function setActiveBudget(tripId: string, budgetId: string) {
      patchTrip(tripId, (t) => { t.activeBudget = budgetId; return t })
    }
    function setAlloc(tripId: string, cat: string, amount: number) {
      patchTrip(tripId, (t) => {
        const b = t.budgets.find((x) => x.id === t.activeBudget) || t.budgets[0]
        if (b) b.alloc[cat] = amount
        return t
      })
    }
    function addCategory(tripId: string, name: string, amount: number) {
      patchTrip(tripId, (t) => {
        const b = t.budgets.find((x) => x.id === t.activeBudget) || t.budgets[0]
        if (b) b.alloc[name] = amount
        return t
      })
    }
    function deleteCategory(tripId: string, name: string) {
      patchTrip(tripId, (t) => {
        const b = t.budgets.find((x) => x.id === t.activeBudget) || t.budgets[0]
        if (b) delete b.alloc[name]
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
    function setOutfitSlot(tripId: string, scope: string, slot: 'top' | 'bottom' | 'shoes' | 'other', value: string) {
      patchTrip(tripId, (t) => {
        const set = t.outfitSets.find((x) => x.scope === scope)
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
    function setMemberRole(tripId: string, id: string, role: Member['role']) {
      patchTrip(tripId, (t) => {
        const m = t.members.find((x) => x.id === id)
        if (m) m.role = role
        return t
      })
    }

    /* ---- trip lifecycle ---- */
    function createTrip(input: Partial<Trip> & { name: string; startIso?: string; len?: number }): string {
      const id = 't' + nextId()
      const len = input.len ?? (input.days?.length || 1)
      const trip: Trip = {
        id,
        name: input.name,
        place: input.place || 'Belum ada destinasi',
        mat: input.mat || 'pantai',
        cover: input.cover || '',
        dates: input.dates || '',
        status: 'draft',
        people: input.people ?? 2,
        plan: input.plan ?? 0,
        startIso: input.startIso,
        days: input.days ?? buildDays(input.startIso || '', len),
        activeBudget: id + '-awal',
        budgets: input.budgets ?? [{ id: id + '-awal', name: 'Rencana awal', note: '', alloc: {} }],
        outfitSets: [],
        manual: [],
        packing: [],
        members: [{ id: 'u1', name: 'Rina Kartika', email: 'rina@jalan.id', role: 'Pemilik', status: 'aktif' }],
      }
      trips.value = [...trips.value, trip]
      return id
    }
    function updateTrip(id: string, patch: Partial<Trip>) {
      patchTrip(id, (t) => Object.assign(t, patch))
    }
    function setSplitBill(id: string, billId: string) {
      patchTrip(id, (t) => { t.splitBillId = billId; return t })
    }

    function resetSeed() {
      trips.value = seedTrips()
      seq.value = 100
    }

    return {
      trips, seq, byId, liveTrip, patchTrip, nextId,
      setActivityField, addActivity, deleteActivity,
      setActiveBudget, setAlloc, addCategory, deleteCategory, addBudgetVersion,
      addManual, deleteManual, updateManual,
      togglePackItem, addPackItem,
      setOutfitSlot, setOutfitScope, addOutfitSet, removeOutfitScope, removeOutfit, setOutfitPerson,
      addMember, removeMember, setMemberRole,
      createTrip, updateTrip, setSplitBill, resetSeed,
    }
  },
  { persist: true },
)
