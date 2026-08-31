<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { CATEGORIES } from '~/types/domain'
import { rp } from '~/utils/format'
import { tone, iconFor } from '~/utils/categories'
import { expenseLines } from '~/utils/derive'

const props = defineProps<{ trip: Trip }>()
const trips = useTripsStore()
const { flash } = useToast()

const groups = computed(() => {
  const map: Record<number, { idx: number; label: string; total: number; items: ReturnType<typeof expenseLines> }> = {}
  for (const l of expenseLines(props.trip)) {
    const g = (map[l.dayIdx] ||= { idx: l.dayIdx, label: props.trip.days[l.dayIdx]?.long || 'Tanpa hari', total: 0, items: [] })
    g.total += l.amount
    g.items.push(l)
  }
  return Object.values(map).sort((a, b) => b.idx - a.idx)
})

// log form
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
function removeLine(id: string) {
  trips.deleteManual(props.trip.id, id)
  flash('Pengeluaran dihapus')
}
</script>

<template>
  <div class="flex flex-wrap gap-5">
    <div class="flex-1 min-w-0 flex flex-col gap-4">
      <div v-for="g in groups" :key="g.idx" class="card p-[16px_20px]">
        <div class="flex items-center justify-between pb-2 border-b border-sand-100">
          <span class="text-[14px] font-700">{{ g.label }}</span>
          <span class="money text-[13.5px] text-ink-2">{{ rp(g.total) }}</span>
        </div>
        <div v-for="l in g.items" :key="l.id" class="flex items-center gap-3 py-[10px]">
          <div class="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0" :style="{ background: tone(l.cat)[0], color: tone(l.cat)[1] }">
            <i :class="iconFor(l.cat)" class="text-[16px]" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-[14px] font-600 truncate">{{ l.title }}</div>
            <div class="text-[12px] text-muted">
              {{ l.cat }} · {{ l.derived ? 'dari aktivitas ' + l.time : 'dicatat manual' }}
            </div>
          </div>
          <div class="money text-[14px] font-600 shrink-0">{{ rp(l.amount) }}</div>
          <button
            v-if="!l.derived"
            class="w-[28px] h-[28px] rounded-full text-muted hover:text-warn-fg hover:bg-warn-bg flex items-center justify-center shrink-0"
            title="Hapus"
            @click="removeLine(l.id)"
          >
            <i class="i-lucide-x text-[15px]" />
          </button>
          <span v-else class="w-[28px] shrink-0" />
        </div>
      </div>
      <div v-if="!groups.length" class="card p-8 text-muted text-[14px]">Belum ada pengeluaran. Catat lewat form di samping.</div>
    </div>

    <div class="w-full lg:w-[340px] lg:shrink-0 flex flex-col gap-4">
      <div class="card p-[18px]">
        <div class="font-display text-[17px] font-600">Catat pengeluaran</div>
        <div class="flex flex-col gap-3 mt-3">
          <CoreInput v-model="amount" label="Jumlah" mono placeholder="0" @keydown.enter="log" />
          <label class="flex flex-col gap-[7px]">
            <span class="text-[12.5px] font-600 text-ink-2">Kategori</span>
            <CoreSelect v-model="cat" :options="[...CATEGORIES]" />
          </label>
          <label class="flex flex-col gap-[7px]">
            <span class="text-[12.5px] font-600 text-ink-2">Hari</span>
            <CoreSelect v-model="dayIdx" :options="dayOptions" />
          </label>
          <CoreInput v-model="note" label="Catatan (opsional)" placeholder="mis. Oleh-oleh" @keydown.enter="log" />
          <CoreButton variant="primary" block @click="log">Catat</CoreButton>
        </div>
      </div>
      <div class="card p-[18px] text-[13px] text-ink-2 leading-[1.5]">
        <div class="font-600 text-ink mb-1">Cara hitung</div>
        Biaya aktivitas otomatis jadi pengeluaran dan tidak bisa dihapus di sini — ubah lewat layar Hari. Biaya dibagi rata ke {{ trip.people }} orang.
      </div>
    </div>
  </div>
</template>
