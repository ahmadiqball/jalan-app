<script setup lang="ts">
import type { Trip } from '~/types/domain'

const props = defineProps<{ trip: Trip }>()
const trips = useTripsStore()
const { flash } = useToast()
const { packing } = useDerived(() => props.trip)
const { recs: allRecs } = useContent()

const newItem = ref('')
const newGroup = ref('Pakaian')
const newReq = ref(false)
const groupOptions = computed(() => {
  const names = props.trip.packing.map((g) => g.name)
  for (const d of ['Dokumen', 'Pakaian', 'Elektronik', 'Perlengkapan', 'Lain-lain']) if (!names.includes(d)) names.push(d)
  return names
})

// recommendations: not already on the list, matching the trip's motif and
// (when tagged) the trip's activity categories — "based on activities"
const existingLabels = computed(() => new Set(props.trip.packing.flatMap((g) => g.items.map((i) => i.label.toLowerCase()))))
const tripCats = computed(() => new Set(props.trip.days.flatMap((d) => d.acts.map((a) => (a.cat === 'Santai' ? 'Lain' : a.cat)))))
const recs = computed(() =>
  allRecs.value.filter((r) => {
    if (existingLabels.value.has(r.label.toLowerCase())) return false
    if (r.mats?.length && !r.mats.includes(props.trip.mat)) return false
    if (r.cats?.length && !r.cats.some((c) => tripCats.value.has(c))) return false
    return true
  }),
)

function add() {
  if (!newItem.value.trim()) return
  trips.addPackItem(props.trip.id, newGroup.value, { label: newItem.value.trim(), req: newReq.value, done: false })
  newItem.value = ''
  newReq.value = false
  flash('Barang ditambahkan')
}
function addRec(r: (typeof recs.value)[number]) {
  trips.addPackItem(props.trip.id, r.group, { label: r.label, req: !!r.req, done: false, ...(r.url ? { url: r.url } : {}) })
  flash(r.label + ' ditambahkan')
}
</script>

<template>
  <div class="flex flex-col gap-5 max-w-[760px]">
    <!-- summary -->
    <div class="bg-sand-100 rounded-card p-[16px_18px] flex items-center gap-[14px] flex-wrap">
      <div class="w-[42px] h-[42px] rounded-full bg-white flex items-center justify-center text-teal-700 shrink-0">
        <i class="i-lucide-luggage text-[20px]" />
      </div>
      <div class="flex-1 min-w-[180px]">
        <div class="text-[14px] font-700">{{ packing.done }} dari {{ packing.total }} dicentang</div>
        <div class="text-[12.5px] text-ink-2">
          {{ packing.reqLeft > 0 ? packing.reqLeft + ' barang wajib belum dicentang' : 'Semua barang wajib sudah siap' }}
        </div>
      </div>
      <div class="w-[160px]"><CoreBar :pct="packing.total ? (packing.done / packing.total) * 100 : 0" :color="'#2F6B54'" /></div>
    </div>

    <!-- groups -->
    <div v-for="(g, gi) in trip.packing" :key="gi" class="flex flex-col gap-1">
      <div class="text-[12.5px] font-700 text-muted uppercase tracking-[.06em] px-[13px]">{{ g.name }}</div>
      <PackingItem v-for="it in g.items" :key="it.id" :item="it" @toggle="trips.togglePackItem(trip.id, it.id)" />
    </div>

    <!-- add item (no buy-link: that comes from recommendations) -->
    <div class="card p-[14px_16px] flex gap-3 flex-wrap items-end">
      <div class="flex-1 min-w-[180px]"><CoreInput v-model="newItem" label="Barang baru" placeholder="mis. Sunblock" @keydown.enter="add" /></div>
      <label class="flex flex-col gap-[7px]"><span class="text-[12.5px] font-600 text-ink-2">Grup</span><CoreSelect v-model="newGroup" :options="groupOptions" /></label>
      <label class="flex items-center gap-2 text-[13.5px] text-ink-2 pb-[10px] cursor-pointer">
        <CoreCheckbox :model-value="newReq" @update:model-value="newReq = $event" /> Wajib
      </label>
      <CoreButton variant="teal" class="!px-[18px] !py-[11px] !text-[13.5px]" @click="add">Tambah</CoreButton>
    </div>

    <!-- app recommendations -->
    <div v-if="recs.length" class="card p-[16px_18px]">
      <div class="flex items-center gap-2">
        <i class="i-lucide-sparkles text-teal-600 text-[16px]" />
        <div class="font-display text-[16px] font-600">Rekomendasi dari Jalan</div>
      </div>
      <div class="text-[12.5px] text-muted mt-[2px]">Saran barang untuk trip {{ trip.mat }} — ketuk untuk menambah.</div>
      <div class="flex flex-wrap gap-2 mt-3">
        <button
          v-for="r in recs"
          :key="r.label"
          class="flex items-center gap-2 rounded-pill border border-sand-line2 px-[12px] py-[7px] text-[13px] text-ink-2 hover:border-teal-600 hover:text-teal-700 transition-colors"
          @click="addRec(r)"
        >
          <i class="i-lucide-plus text-[14px] text-teal-600" />
          {{ r.label }}
          <span v-if="r.req" class="text-[10.5px] font-700 text-warn-fg">wajib</span>
        </button>
      </div>
    </div>
  </div>
</template>
