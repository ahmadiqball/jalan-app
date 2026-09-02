<script setup lang="ts">
import type { ManualExpense, Trip } from '~/types/domain'
import { CATEGORIES } from '~/types/domain'
import { rp, initials } from '~/utils/format'
import { tone, iconFor } from '~/utils/categories'
import { expenseLines } from '~/utils/derive'

const props = defineProps<{ trip: Trip }>()
const trips = useTripsStore()
const { flash } = useToast()

const mode = ref<'Hari' | 'Kategori' | 'Orang'>('Hari')
const allIds = computed(() => props.trip.members.map((m) => m.id))

const lines = computed(() => expenseLines(props.trip))

// group by day
const byDay = computed(() => {
  const map: Record<number, { key: string; label: string; total: number; items: typeof lines.value }> = {}
  for (const l of lines.value) {
    const g = (map[l.dayIdx] ||= { key: 'd' + l.dayIdx, label: props.trip.days[l.dayIdx]?.long || 'Tanpa hari', total: 0, items: [] })
    g.total += l.amount
    g.items.push(l)
  }
  return Object.values(map).sort((a, b) => Number(b.key.slice(1)) - Number(a.key.slice(1)))
})
// group by category
const byCat = computed(() => {
  const map: Record<string, { key: string; label: string; total: number; items: typeof lines.value }> = {}
  for (const l of lines.value) {
    const g = (map[l.cat] ||= { key: l.cat, label: l.cat, total: 0, items: [] })
    g.total += l.amount
    g.items.push(l)
  }
  return Object.values(map).sort((a, b) => b.total - a.total)
})
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
const editAmount = ref('')
function openEdit(l: (typeof lines.value)[number]) {
  const m = props.trip.manual.find((x) => x.id === l.id)
  if (!m) return
  editing.value = { ...m }
  editAmount.value = String(m.amount)
}
function saveEdit() {
  if (!editing.value) return
  trips.updateManual(props.trip.id, editing.value.id, {
    title: editing.value.title.trim() || editing.value.cat,
    cat: editing.value.cat,
    dayIdx: editing.value.dayIdx,
    amount: parseInt(editAmount.value.replace(/[^0-9]/g, '') || '0', 10),
    note: editing.value.note,
  })
  editing.value = null
  flash('Pengeluaran diperbarui')
}
function removeLine(id: string) {
  trips.deleteManual(props.trip.id, id)
  flash('Pengeluaran dihapus')
}

/* pete-pete split / settle-up — embedded inside jalan (no leaving the app) */
const pete = usePetePete()
const splitOpen = ref(false)
const splitUrl = computed(() => (props.trip.splitBillId ? pete.billUrl(props.trip.splitBillId) : ''))
async function bagiRata() {
  try {
    let id = props.trip.splitBillId
    if (!id) {
      id = (await pete.createSplit(props.trip)) || undefined
      if (!id) return
      trips.setSplitBill(props.trip.id, id)
      flash('Split dibuat di PetePete')
    }
    splitOpen.value = true
  } catch {
    flash('Gagal membuka PetePete')
  }
}
function newSplit() {
  trips.setSplitBill(props.trip.id, '')
  bagiRata()
}

/* log form */
const amount = ref('')
const cat = ref<string>('Makan & minum')
const dayIdx = ref('0')
const note = ref('')
const dayOptions = computed(() => props.trip.days.map((d, i) => ({ value: String(i), label: d.date })))
function log() {
  const amt = parseInt(amount.value.replace(/[^0-9]/g, '') || '0', 10)
  if (!amt) return
  trips.addManual(props.trip.id, { title: note.value.trim() || cat.value, cat: cat.value, dayIdx: parseInt(dayIdx.value, 10), amount: amt, note: note.value.trim() })
  amount.value = ''
  note.value = ''
  flash('Pengeluaran dicatat')
}
</script>

<template>
  <div class="flex flex-wrap gap-5">
    <div class="flex-1 min-w-0 flex flex-col gap-4">
      <!-- filter -->
      <div class="flex items-center gap-2">
        <span class="eyebrow mr-1">Tampilkan</span>
        <button v-for="m in ['Hari', 'Kategori', 'Orang']" :key="m" :class="mode === m ? 'chip-active' : 'chip-idle'" class="!py-[7px] !px-[13px] !text-[12.5px]" @click="mode = m as typeof mode">{{ m }}</button>
      </div>

      <!-- by person -->
      <div v-if="mode === 'Orang'" class="card p-[6px_18px]">
        <div v-for="p in byPerson" :key="p.member.id" class="flex items-center gap-3 py-[12px] border-b border-sand-100 last:border-0">
          <span class="w-[34px] h-[34px] rounded-full bg-sand-100 text-ink-2 flex items-center justify-center text-[12px] font-700 shrink-0">{{ initials(p.member.name) }}</span>
          <div class="flex-1 min-w-0"><div class="text-[14px] font-600 truncate">{{ p.member.name }}</div><div class="text-[12px] text-muted">bagian dari total</div></div>
          <div class="money text-[14px] font-600">{{ rp(p.total) }}</div>
        </div>
      </div>

      <!-- by day / category -->
      <div v-for="g in (mode === 'Kategori' ? byCat : byDay)" v-else :key="g.key" class="card p-[16px_20px]">
        <div class="flex items-center justify-between pb-2 border-b border-sand-100">
          <span class="text-[14px] font-700 flex items-center gap-2">
            <span v-if="mode === 'Kategori'" class="w-[10px] h-[10px] rounded-full" :style="{ background: tone(g.label)[1] }" />
            {{ g.label }}
          </span>
          <span class="money text-[13.5px] text-ink-2">{{ rp(g.total) }}</span>
        </div>
        <div v-for="l in g.items" :key="l.id" class="flex items-center gap-3 py-[10px]">
          <div class="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0" :style="{ background: tone(l.cat)[0], color: tone(l.cat)[1] }">
            <i :class="iconFor(l.cat)" class="text-[16px]" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-[14px] font-600 truncate">{{ l.title }}</div>
            <div class="text-[12px] text-muted">
              {{ mode === 'Kategori' ? (trip.days[l.dayIdx]?.date || '') + ' · ' : l.cat + ' · ' }}{{ l.derived ? 'dari aktivitas ' + l.time : 'dicatat manual' }}
            </div>
          </div>
          <div class="money text-[14px] font-600 shrink-0">{{ rp(l.amount) }}</div>
          <template v-if="!l.derived">
            <button class="w-[28px] h-[28px] rounded-full text-muted hover:text-teal-700 hover:bg-teal-100 flex items-center justify-center shrink-0" title="Ubah" @click="openEdit(l)"><i class="i-lucide-pencil text-[14px]" /></button>
            <button class="w-[28px] h-[28px] rounded-full text-muted hover:text-warn-fg hover:bg-warn-bg flex items-center justify-center shrink-0" title="Hapus" @click="removeLine(l.id)"><i class="i-lucide-x text-[15px]" /></button>
          </template>
          <span v-else class="text-[11px] text-muted shrink-0 w-[92px] text-right">dari aktivitas</span>
        </div>
      </div>

      <div v-if="!lines.length" class="card p-8 text-muted text-[14px]">Belum ada pengeluaran. Catat lewat form di samping.</div>
    </div>

    <div class="w-full lg:w-[340px] lg:shrink-0 flex flex-col gap-4">
      <div class="card p-[18px]">
        <div class="font-display text-[17px] font-600">Catat pengeluaran</div>
        <div class="flex flex-col gap-3 mt-3">
          <CoreInput v-model="amount" label="Jumlah" mono placeholder="0" @keydown.enter="log" />
          <label class="flex flex-col gap-[7px]"><span class="text-[12.5px] font-600 text-ink-2">Kategori</span><CoreSelect v-model="cat" :options="[...CATEGORIES]" /></label>
          <label class="flex flex-col gap-[7px]"><span class="text-[12.5px] font-600 text-ink-2">Hari</span><CoreSelect v-model="dayIdx" :options="dayOptions" /></label>
          <CoreInput v-model="note" label="Catatan (opsional)" placeholder="mis. Oleh-oleh" @keydown.enter="log" />
          <CoreButton variant="primary" block @click="log">Catat</CoreButton>
        </div>
      </div>
      <div class="card p-[18px] text-[13px] text-ink-2 leading-[1.5]">
        <div class="font-600 text-ink mb-1">Cara hitung</div>
        Biaya aktivitas otomatis jadi pengeluaran — ubah lewat layar Hari. Pengeluaran manual bisa diubah langsung di sini.
      </div>

      <!-- pete-pete handoff -->
      <div v-if="pete.enabled.value" class="card p-[18px]">
        <div class="flex items-center gap-2">
          <i class="i-lucide-split text-teal-600 text-[17px]" />
          <div class="font-display text-[16px] font-600">Bagi rata &amp; lunas-lunasan</div>
        </div>
        <p class="text-[13px] text-ink-2 leading-[1.5] mt-1">
          Serahkan urusan siapa bayar siapa ke <span class="font-600">PetePete</span> — bisa beberapa yang bayar, split per item, sampai rekap siapa transfer ke siapa.
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

    <!-- edit manual entry -->
    <CoreDialog v-if="editing" v-model:open="editOpen" side="center" :width="440" title="Ubah pengeluaran">
      <div class="flex flex-col gap-3">
        <CoreInput v-model="editing.title" label="Judul" placeholder="mis. Oleh-oleh" />
        <CoreInput v-model="editAmount" label="Jumlah" mono placeholder="0" />
        <label class="flex flex-col gap-[7px]"><span class="text-[12.5px] font-600 text-ink-2">Kategori</span><CoreSelect v-model="editing.cat" :options="[...CATEGORIES]" /></label>
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
