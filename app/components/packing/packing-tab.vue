<script setup lang="ts">
import type { Trip } from '~/types/domain'

const props = defineProps<{ trip: Trip }>()
const trips = useTripsStore()
const { flash } = useToast()
const { packing } = useDerived(() => props.trip)

const newItem = ref('')
const newGroup = ref('Pakaian')
const newReq = ref(false)
const newUrl = ref('')
const groupOptions = computed(() => {
  const names = props.trip.packing.map((g) => g.name)
  for (const d of ['Dokumen', 'Pakaian', 'Elektronik', 'Lain-lain']) if (!names.includes(d)) names.push(d)
  return names
})

function add() {
  if (!newItem.value.trim()) return
  trips.addPackItem(props.trip.id, newGroup.value, {
    label: newItem.value.trim(),
    req: newReq.value,
    done: false,
    ...(newUrl.value.trim() ? { url: newUrl.value.trim() } : {}),
  })
  newItem.value = ''
  newUrl.value = ''
  newReq.value = false
  flash('Barang ditambahkan')
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
      <PackingItem
        v-for="it in g.items"
        :key="it.id"
        :item="it"
        @toggle="trips.togglePackItem(trip.id, it.id)"
      />
    </div>

    <!-- add item -->
    <div class="card p-[14px_16px] flex flex-col gap-3">
      <div class="flex gap-3 flex-wrap items-end">
        <div class="flex-1 min-w-[180px]">
          <CoreInput v-model="newItem" label="Barang baru" placeholder="mis. Sunblock" @keydown.enter="add" />
        </div>
        <label class="flex flex-col gap-[7px]">
          <span class="text-[12.5px] font-600 text-ink-2">Grup</span>
          <CoreSelect v-model="newGroup" :options="groupOptions" />
        </label>
      </div>
      <div class="flex gap-3 flex-wrap items-end">
        <div class="flex-1 min-w-[180px]">
          <CoreInput v-model="newUrl" label="Link beli (opsional)" placeholder="https://…" @keydown.enter="add" />
        </div>
        <label class="flex items-center gap-2 text-[13.5px] text-ink-2 pb-[10px] cursor-pointer">
          <CoreCheckbox :model-value="newReq" @update:model-value="newReq = $event" />
          Wajib
        </label>
        <CoreButton variant="teal" class="!px-[18px] !py-[11px] !text-[13.5px]" @click="add">Tambah</CoreButton>
      </div>
    </div>
  </div>
</template>
