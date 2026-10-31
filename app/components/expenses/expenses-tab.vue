<script setup lang="ts">
import type { ExpenseLine, ManualExpense, Trip } from '~/types/domain'
import { CATEGORIES } from '~/types/domain'
import { rp, shortRp, initials, addDays, DOW_LONG, MON_LONG } from '~/utils/format'
import { BAR_NEAR, BAR_OK, BAR_OVER, tone, iconFor, catLabel, budgetCatOf } from '~/utils/categories'
import { budgetSummary, expenseLines } from '~/utils/derive'

const catOptions = CATEGORIES.map((c) => ({ value: c, label: catLabel(c) }))

const props = defineProps<{ trip: Trip }>()
const trips = useTripsStore()
const { flash } = useToast()
const { confirm } = useConfirm()
const { t } = useI18n()

const mode = ref<'Hari' | 'Kategori' | 'Orang'>('Hari')
const allIds = computed(() => props.trip.members.map((m) => m.id))

const lines = computed(() => expenseLines(props.trip))
interface ExpenseGroup { key: string; label: string; sub: string; total: number; plan: number; items: ExpenseLine[] }

// planned activity costs not yet recorded as spent (opt-in from here)
const unpaidPlanned = computed(() => {
  const out: { id: string; title: string; cat: string; amount: number; dayLabel: string }[] = []
  props.trip.days.forEach((d) =>
    d.acts.forEach((a) => {
      if (a.cost > 0 && !a.paid) out.push({ id: a.id, title: a.title, cat: budgetCatOf(a.cat), amount: a.cost, dayLabel: d.date })
    }),
  )
  return out
})
// popup listing the planned costs; a row can expand to record a different amount
const planOpen = ref(false)
const plannedTotal = computed(() => unpaidPlanned.value.reduce((n, a) => n + a.amount, 0))
const recordId = ref<string | null>(null)
const recordAmount = ref(0)
const recordTarget = computed(() => unpaidPlanned.value.find((a) => a.id === recordId.value) ?? null)
const recordDelta = computed(() => recordAmount.value - (recordTarget.value?.amount ?? 0))
function openRecord(a: { id: string; amount: number }) {
  recordId.value = recordId.value === a.id ? null : a.id
  recordAmount.value = a.amount
}
function confirmRecord() {
  const t = recordTarget.value
  if (!t) return
  trips.setActivityField(props.trip.id, t.id, 'actual', recordAmount.value)
  trips.setActivityField(props.trip.id, t.id, 'paid', true)
  recordId.value = null
  flash('Dicatat sebagai pengeluaran')
}
watch(planOpen, (v) => { if (!v) recordId.value = null })
// nothing left to record: the entry point disappears, so close the popup too
watch(() => unpaidPlanned.value.length, (n) => { if (!n) planOpen.value = false })
function record(id: string) {
  trips.setActivityField(props.trip.id, id, 'paid', true)
  flash('Dicatat sebagai pengeluaran')
}

// full "Jumat, 14 Oktober 2026" for a day index (falls back to the stored long label)
function dayDateFull(i: number): string {
  if (props.trip.startIso) {
    const d = addDays(props.trip.startIso, i)
    return `${DOW_LONG[d.getDay()]}, ${d.getDate()} ${MON_LONG[d.getMonth()]} ${d.getFullYear()}`
  }
  return props.trip.days[i]?.long || ''
}
// a day's plan is every activity cost that day, recorded or not
function dayPlan(i: number): number {
  return (props.trip.days[i]?.acts || []).reduce((n, a) => n + (a.cost || 0), 0)
}
// group by day
const byDay = computed(() => {
  const map: Record<number, ExpenseGroup & { dayIdx: number }> = {}
  for (const l of lines.value) {
    const g = (map[l.dayIdx] ||= { key: 'd' + l.dayIdx, dayIdx: l.dayIdx, label: 'Hari ' + (l.dayIdx + 1), sub: dayDateFull(l.dayIdx), total: 0, plan: dayPlan(l.dayIdx), items: [] })
    g.total += l.amount
    g.items.push(l)
  }
  return Object.values(map).sort((a, b) => a.dayIdx - b.dayIdx)
})
// group by category, compared against the active budget's allocation
const byCat = computed(() => {
  const { alloc } = budgetSummary(props.trip)
  const map: Record<string, ExpenseGroup> = {}
  for (const l of lines.value) {
    const g = (map[l.cat] ||= { key: l.cat, label: catLabel(l.cat), sub: '', total: 0, plan: alloc[l.cat] || 0, items: [] })
    g.total += l.amount
    g.items.push(l)
  }
  return Object.values(map)
    .map((g) => ({ ...g, sub: g.items.length + ' pengeluaran' }))
    .sort((a, b) => b.total - a.total)
})
function barColor(g: ExpenseGroup): string {
  const pct = (g.total / g.plan) * 100
  return pct > 100 ? BAR_OVER : pct >= 80 ? BAR_NEAR : BAR_OK
}
// accordion: groups start collapsed so the page stays a scannable summary
const openGroups = ref(new Set<string>())
function toggleGroup(key: string) {
  if (!openGroups.value.delete(key)) openGroups.value.add(key)
}

// per-person shares (activities split by participants; manual split across everyone)
const byPerson = computed(() => {
  const people = props.trip.members.length || props.trip.people || 1
  const totals: Record<string, number> = {}
  for (const id of allIds.value) totals[id] = 0
  props.trip.days.forEach((d) =>
    d.acts.forEach((a) => {
      if (a.cost <= 0) return
      const parts = a.participants?.length ? a.participants : allIds.value
      const share = a.cost / (parts.length || 1)
      parts.forEach((id) => { if (id in totals) totals[id] = (totals[id] || 0) + share })
    }),
  )
  const manualTotal = (props.trip.manual || []).reduce((n, m) => n + m.amount, 0)
  for (const id of allIds.value) totals[id]! += manualTotal / people
  return props.trip.members.map((m) => ({ member: m, total: totals[m.id] || 0 })).sort((a, b) => b.total - a.total)
})

/* edit manual entry */
const editing = ref<ManualExpense | null>(null)
const editOpen = computed({ get: () => !!editing.value, set: (v) => { if (!v) editing.value = null } })
const editAmount = ref(0)
function openEdit(l: (typeof lines.value)[number]) {
  const m = props.trip.manual.find((x) => x.id === l.id)
  if (!m) return
  editing.value = { ...m }
  editAmount.value = m.amount
}
function saveEdit() {
  if (!editing.value) return
  trips.updateManual(props.trip.id, editing.value.id, {
    title: editing.value.title.trim() || editing.value.cat,
    cat: editing.value.cat,
    dayIdx: editing.value.dayIdx,
    amount: editAmount.value,
    note: editing.value.note,
  })
  editing.value = null
  flash('Pengeluaran diperbarui')
}
async function removeLine(line: { id: string; title: string; amount: number }) {
  const ok = await confirm({
    title: t('confirm.delExpTitle'),
    message: t('confirm.delExpMsg', { title: line.title, amount: rp(line.amount) }),
    confirmLabel: t('confirm.delExpCta'),
    danger: true,
  })
  if (!ok) return
  trips.deleteManual(props.trip.id, line.id)
  flash('Pengeluaran dihapus')
}

/* pete-pete split / settle-up — embedded inside jalan (no leaving the app) */
const pete = usePetePete()
const splitOpen = ref(false)
const splitUrl = computed(() => (props.trip.splitBillId ? pete.billUrl(props.trip.splitBillId) : ''))
async function bagiRata() {
  try {
    const isNew = !props.trip.splitBillId
    // create the bill on first use; either way reconcile the latest spending
    const res = await pete.sync(props.trip)
    if (!res) return
    // persist the id (it may differ if the bill was recreated in pete-pete)
    if (res.id !== props.trip.splitBillId) trips.setSplitBill(props.trip.id, res.id)
    trips.setSplitMap(props.trip.id, res.map)
    flash(isNew ? 'Split dibuat di PetePete' : 'Split disinkronkan')
    splitOpen.value = true
  } catch {
    flash('Gagal membuka PetePete')
  }
}
async function newSplit() {
  const ok = await confirm({
    title: t('confirm.newSplitTitle'),
    message: t('confirm.newSplitMsg'),
    confirmLabel: t('confirm.newSplitCta'),
  })
  if (!ok) return
  trips.setSplitBill(props.trip.id, '')
  bagiRata()
}

/* log form (in a popup) */
const logOpen = ref(false)
const amount = ref(0)
const cat = ref<string>('Makan & minum')
const dayIdx = ref('0')
const note = ref('')
const dayOptions = computed(() => props.trip.days.map((d, i) => ({ value: String(i), label: d.date })))
function log() {
  if (!amount.value) return
  trips.addManual(props.trip.id, { title: note.value.trim() || cat.value, cat: cat.value, dayIdx: parseInt(dayIdx.value, 10), amount: amount.value, note: note.value.trim() })
  amount.value = 0
  note.value = ''
  logOpen.value = false
  flash('Pengeluaran dicatat')
}
</script>

<template>
  <div class="flex flex-wrap gap-5">
    <div class="flex-1 min-w-0 flex flex-col gap-4">
      <div class="flex items-center justify-between gap-3">
        <div class="font-display text-[24px] font-600">Pengeluaran</div>
        <CoreButton variant="primary" class="!px-[16px] !py-[10px] !text-[13.5px]" @click="logOpen = true">
          <i class="i-lucide-plus" /> Catat
        </CoreButton>
      </div>
      <!-- filter -->
      <div class="flex items-center gap-2 flex-wrap">
        <span class="eyebrow mr-1">Tampilkan</span>
        <button v-for="m in ['Hari', 'Kategori', 'Orang']" :key="m" :class="mode === m ? 'chip-active' : 'chip-idle'" class="!py-[7px] !px-[13px] !text-[12.5px]" @click="mode = m as typeof mode">{{ m }}</button>
      </div>

      <!-- planned costs waiting to be recorded as spent: the list lives in a popup -->
      <button v-if="unpaidPlanned.length" class="card border-dashed p-[12px_16px] flex items-center gap-3 text-left hover:border-teal-600" @click="planOpen = true">
        <i class="i-lucide-clock text-teal-600 text-[18px] shrink-0" />
        <span class="flex-1 min-w-0">
          <span class="block text-[14px] font-700 leading-tight">{{ unpaidPlanned.length }} rencana belum dicatat</span>
          <span class="block money text-[12px] text-muted mt-[2px]">{{ rp(plannedTotal) }}</span>
        </span>
        <span class="rounded-pill bg-teal-100 text-teal-700 px-[13px] py-[6px] text-[12.5px] font-700 shrink-0">Catat</span>
      </button>

      <!-- by person -->
      <div v-if="mode === 'Orang'" class="card p-[6px_18px]">
        <div v-for="p in byPerson" :key="p.member.id" class="flex items-center gap-3 py-[12px] border-b border-sand-100 last:border-0">
          <span class="w-[34px] h-[34px] rounded-full bg-sand-100 text-ink-2 flex items-center justify-center text-[12px] font-700 shrink-0">{{ initials(p.member.name) }}</span>
          <div class="flex-1 min-w-0"><div class="text-[14px] font-600 truncate">{{ p.member.name }}</div><div class="text-[12px] text-muted">bagian dari total</div></div>
          <div class="money text-[14px] font-600">{{ rp(p.total) }}</div>
        </div>
      </div>

      <!-- by day / category -->
      <div v-for="g in (mode === 'Kategori' ? byCat : byDay)" v-else :key="g.key" class="card overflow-hidden">
        <button class="w-full flex flex-col gap-[8px] p-[14px_16px] md:p-[16px_20px] text-left" :aria-expanded="openGroups.has(g.key)" @click="toggleGroup(g.key)">
          <span class="w-full flex items-center gap-2">
            <span v-if="mode === 'Kategori'" class="w-[10px] h-[10px] rounded-full shrink-0" :style="{ background: tone(g.key)[1] }" />
            <span class="flex-1 min-w-0">
              <span class="block text-[14px] font-700 leading-tight truncate">{{ g.label }}</span>
              <span class="block text-[11.5px] text-muted leading-tight truncate mt-[2px]">{{ g.sub }}</span>
            </span>
            <span class="money text-[14px] font-600 shrink-0">{{ rp(g.total) }}</span>
            <i class="i-lucide-chevron-down text-[17px] text-muted shrink-0 transition-transform" :class="openGroups.has(g.key) ? 'rotate-180' : ''" />
          </span>
          <!-- progress against the day's plan / the category's allocation -->
          <span v-if="g.plan" class="block w-full h-[6px] rounded-full bg-sand-100 overflow-hidden">
            <span class="block h-full rounded-full" :style="{ width: Math.min(100, (g.total / g.plan) * 100) + '%', background: barColor(g) }" />
          </span>
          <span class="w-full flex items-center justify-between gap-2 text-[11.5px] leading-none">
            <span class="font-700" :class="g.total > g.plan ? 'text-warn-fg' : 'text-teal-700'">
              {{ g.total > g.plan ? 'Lewat ' + shortRp(g.total - g.plan) : g.total < g.plan ? 'Sisa ' + shortRp(g.plan - g.total) : 'Pas' }}
            </span>
            <span class="text-muted">
              <template v-if="g.plan">dari <span class="money">{{ rp(g.plan) }}</span></template>
              <template v-else>tanpa {{ mode === 'Kategori' ? 'anggaran' : 'rencana' }}</template>
            </span>
          </span>
        </button>
        <div v-if="openGroups.has(g.key)" class="px-[16px] md:px-[20px] pb-[6px] border-t border-sand-100">
        <div v-for="l in g.items" :key="l.id" class="flex items-center gap-3 py-[10px]">
          <div class="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0" :style="{ background: tone(l.cat)[0], color: tone(l.cat)[1] }">
            <i :class="iconFor(l.cat)" class="text-[16px]" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-[14px] font-600 truncate">{{ l.title }}</div>
            <div class="flex items-center gap-[6px] min-w-0 mt-[2px]">
              <span class="text-[12px] text-muted truncate">{{ mode === 'Kategori' ? trip.days[l.dayIdx]?.date : catLabel(l.cat) }}</span>
              <span v-if="l.derived" class="shrink-0 rounded-pill bg-teal-100 text-teal-700 px-[7px] py-[3px] text-[10.5px] font-700 leading-none">Terencana</span>
            </div>
          </div>
          <div class="flex flex-col items-end gap-[3px] shrink-0">
            <div class="money text-[14px] font-600">{{ rp(l.amount) }}</div>
            <div v-if="!l.derived" class="flex items-center gap-1">
              <button class="w-[28px] h-[28px] rounded-full text-muted hover:text-teal-700 hover:bg-teal-100 flex items-center justify-center" title="Ubah" @click="openEdit(l)"><i class="i-lucide-pencil text-[14px]" /></button>
              <button class="w-[28px] h-[28px] rounded-full text-muted hover:text-warn-fg hover:bg-warn-bg flex items-center justify-center" title="Hapus" @click="removeLine(l)"><i class="i-lucide-x text-[15px]" /></button>
            </div>
            <!-- actual differs from the planned activity cost: show the gap -->
            <template v-else-if="l.planned != null && l.amount !== l.planned">
              <span
                class="flex items-center gap-[2px] rounded-pill px-[7px] py-[2px] text-[10.5px] font-700 leading-none"
                :class="l.amount > l.planned ? 'bg-warn-bg text-warn-fg' : 'bg-teal-100 text-teal-700'"
              >
                <i :class="l.amount > l.planned ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="text-[11px]" />
                {{ l.amount > l.planned ? '+' : '−' }}{{ shortRp(Math.abs(l.amount - l.planned)) }}
              </span>
              <span class="text-[10.5px] text-muted leading-none">rencana <span class="money line-through">{{ rp(l.planned) }}</span></span>
            </template>
          </div>
        </div>
        </div>
      </div>

      <div v-if="!lines.length" class="card p-8 text-center text-muted text-[14px]">Belum ada pengeluaran. Ketuk <span class="font-600 text-ink-2">Catat</span> untuk menambah.</div>
    </div>

    <div class="w-full lg:w-[340px] lg:shrink-0 flex flex-col gap-4">
      <div class="card p-[18px] text-[13px] text-ink-2 leading-[1.5]">
        <div class="font-600 text-ink mb-1">Cara hitung</div>
        Biaya aktivitas awalnya cuma rencana — baru masuk terpakai setelah ditandai <span class="font-600">sudah dibayar</span> (di layar Hari atau "Catat" di atas). Pengeluaran manual bisa diubah langsung di sini.
      </div>

      <!-- pete-pete handoff -->
      <div v-if="pete.enabled.value" class="card p-[18px]">
        <div class="flex items-center gap-2">
          <i class="i-lucide-split text-teal-600 text-[17px]" />
          <div class="font-display text-[16px] font-600">Bagi rata &amp; lunas-lunasan</div>
        </div>
        <p class="text-[13px] text-ink-2 leading-[1.5] mt-1">
          Pengeluaran yang sudah tercatat langsung dikirim ke <span class="font-600">PetePete</span> — dibagi sesuai peserta tiap aktivitas. Atur siapa yang bayar & lunas-lunasan di sana.
        </p>
        <template v-if="trip.splitBillId">
          <CoreButton variant="teal" block class="mt-3" @click="splitOpen = true">
            <i class="i-lucide-split text-[15px]" /> Buka split
          </CoreButton>
          <button class="w-full text-[12.5px] font-600 text-muted mt-2 hover:text-teal-700 disabled:opacity-50" :disabled="pete.busy.value" @click="newSplit">Buat split baru</button>
        </template>
        <CoreButton v-else variant="primary" block class="mt-3" :disabled="pete.busy.value" @click="bagiRata">
          {{ pete.busy.value ? 'Menyiapkan…' : 'Bagi rata di PetePete' }}
        </CoreButton>
      </div>
    </div>

    <ExpensesSplitEmbed v-model:open="splitOpen" :url="splitUrl" />

    <!-- planned costs: record as planned, or expand a row for a different amount -->
    <CoreDialog v-model:open="planOpen" side="center" :width="520" title="Catat dari rencana">
      <div class="text-[12.5px] text-muted mb-1">Biaya aktivitas baru jadi pengeluaran setelah dicatat. Anggaran rencana tidak ikut berubah.</div>
      <div v-for="a in unpaidPlanned" :key="a.id" class="py-[10px] border-b border-sand-100 last:border-0">
        <div class="flex items-center gap-3">
          <div class="w-[32px] h-[32px] rounded-[10px] flex items-center justify-center shrink-0" :style="{ background: tone(a.cat)[0], color: tone(a.cat)[1] }">
            <i :class="iconFor(a.cat)" class="text-[15px]" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-[13.5px] font-600 truncate">{{ a.title }}</div>
            <div class="text-[12px] text-muted truncate">{{ a.dayLabel }} · <span class="money">{{ rp(a.amount) }}</span></div>
          </div>
          <button class="w-[30px] h-[30px] rounded-full border border-sand-line2 text-muted hover:text-teal-700 hover:border-teal-600 flex items-center justify-center shrink-0" title="Catat dengan jumlah berbeda" aria-label="Catat dengan jumlah berbeda" @click="openRecord(a)"><i class="i-lucide-pencil text-[13px]" /></button>
          <button class="rounded-pill bg-teal-100 text-teal-700 px-[13px] py-[6px] text-[12.5px] font-700 hover:bg-teal-deep shrink-0" @click="record(a.id)">Catat</button>
        </div>
        <div v-if="recordId === a.id" class="mt-3 flex flex-col gap-2">
          <label class="flex flex-col gap-[7px]"><span class="text-[12.5px] font-600 text-ink-2">Jumlah sebenarnya</span><CoreMoneyInput :model-value="recordAmount" @update:model-value="recordAmount = $event" @keydown.enter="confirmRecord" /></label>
          <div class="flex items-center justify-between gap-2">
            <span
              v-if="recordDelta !== 0"
              class="flex items-center gap-[2px] rounded-pill px-[8px] py-[3px] text-[12px] font-700 leading-none"
              :class="recordDelta > 0 ? 'bg-warn-bg text-warn-fg' : 'bg-teal-100 text-teal-700'"
            >
              <i :class="recordDelta > 0 ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="text-[12px]" />
              {{ recordDelta > 0 ? '+' : '−' }}{{ shortRp(Math.abs(recordDelta)) }} dari rencana
            </span>
            <CoreButton variant="primary" class="ml-auto !px-[16px] !py-[8px] !text-[13px]" @click="confirmRecord">Simpan</CoreButton>
          </div>
        </div>
      </div>
    </CoreDialog>

    <!-- log expense (popup) -->
    <CoreDialog v-model:open="logOpen" side="center" :width="440" title="Catat pengeluaran">
      <div class="flex flex-col gap-3">
        <label class="flex flex-col gap-[7px]"><span class="text-[12.5px] font-600 text-ink-2">Jumlah</span><CoreMoneyInput :model-value="amount" @update:model-value="amount = $event" @keydown.enter="log" /></label>
        <label class="flex flex-col gap-[7px]"><span class="text-[12.5px] font-600 text-ink-2">Kategori</span><CoreSelect v-model="cat" :options="catOptions" /></label>
        <label class="flex flex-col gap-[7px]"><span class="text-[12.5px] font-600 text-ink-2">Hari</span><CoreSelect v-model="dayIdx" :options="dayOptions" /></label>
        <CoreInput v-model="note" label="Catatan (opsional)" placeholder="mis. Oleh-oleh" @keydown.enter="log" />
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <CoreButton variant="ghost" class="!px-[16px] !py-[10px] !text-[13.5px]" @click="logOpen = false">Batal</CoreButton>
          <CoreButton variant="primary" class="!px-[18px] !py-[10px] !text-[13.5px]" @click="log">Catat</CoreButton>
        </div>
      </template>
    </CoreDialog>

    <!-- edit manual entry -->
    <CoreDialog v-if="editing" v-model:open="editOpen" side="center" :width="440" title="Ubah pengeluaran">
      <div class="flex flex-col gap-3">
        <CoreInput v-model="editing.title" label="Judul" placeholder="mis. Oleh-oleh" />
        <label class="flex flex-col gap-[7px]"><span class="text-[12.5px] font-600 text-ink-2">Jumlah</span><CoreMoneyInput :model-value="editAmount" @update:model-value="editAmount = $event" /></label>
        <label class="flex flex-col gap-[7px]"><span class="text-[12.5px] font-600 text-ink-2">Kategori</span><CoreSelect v-model="editing.cat" :options="catOptions" /></label>
        <label class="flex flex-col gap-[7px]"><span class="text-[12.5px] font-600 text-ink-2">Hari</span><CoreSelect :model-value="String(editing.dayIdx)" :options="dayOptions" @update:model-value="editing.dayIdx = parseInt($event, 10)" /></label>
        <CoreInput v-model="editing.note" label="Catatan (opsional)" />
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <CoreButton variant="ghost" class="!px-[16px] !py-[10px] !text-[13.5px]" @click="editing = null">Batal</CoreButton>
          <CoreButton variant="primary" class="!px-[18px] !py-[10px] !text-[13.5px]" @click="saveEdit">Simpan</CoreButton>
        </div>
      </template>
    </CoreDialog>
  </div>
</template>
