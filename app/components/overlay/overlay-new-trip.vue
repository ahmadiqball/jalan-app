<script setup lang="ts">
import { rangeLabel } from '~/utils/format'
import { coverForMat } from '~/utils/categories'

const ui = useUiStore()
const trips = useTripsStore()
const session = useSessionStore()
const { flash } = useToast()
const cloud = useIsCloud()

const name = ref('')
const place = ref('')
const placeId = ref<string | undefined>(undefined)
const mat = ref('pantai')
const cover = ref(coverForMat('pantai'))
const startIso = ref('')
const len = ref(4)

watch(
  () => ui.showNewTrip,
  (o) => {
    if (o) {
      name.value = ''; place.value = ''; placeId.value = undefined
      mat.value = 'pantai'; cover.value = coverForMat('pantai')
      startIso.value = ''; len.value = 4
    }
  },
)

const open = computed({ get: () => ui.showNewTrip, set: (v: boolean) => (ui.showNewTrip = v) })
const dateLabel = computed(() => rangeLabel(startIso.value, len.value))

function create() {
  if (!name.value.trim()) return
  const id = trips.createTrip({
    name: name.value.trim(),
    place: place.value.trim(),
    placeId: placeId.value,
    mat: mat.value,
    cover: cover.value,
    startIso: startIso.value,
    len: Math.max(1, len.value),
    dates: rangeLabel(startIso.value, Math.max(1, len.value)) === 'belum diatur' ? '' : rangeLabel(startIso.value, Math.max(1, len.value)),
    owner: cloud ? { name: session.name, email: session.email } : undefined,
  })
  ui.showNewTrip = false
  flash('Trip dibuat')
  navigateTo(`/trip/${id}/days`)
}
</script>

<template>
  <CoreDialog v-model:open="open" side="center" :width="560" title="Trip baru">
    <div class="flex flex-col gap-4">
      <label class="flex flex-col gap-[6px]"><span class="eyebrow">Nama trip</span><input v-model="name" class="field" placeholder="mis. Sumba Timur"></label>
      <div class="flex flex-col gap-[6px]">
        <span class="eyebrow">Destinasi</span>
        <CorePlaceInput
          :model-value="place"
          :place-id="placeId"
          placeholder="Cari kota atau tempat…"
          @update:model-value="place = $event"
          @update:place-id="placeId = $event"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-[6px]"><span class="eyebrow">Tanggal mulai</span><CoreDatePicker v-model="startIso" /></label>
        <label class="flex flex-col gap-[6px]"><span class="eyebrow">Jumlah hari</span><input v-model.number="len" type="number" min="1" class="field money"></label>
      </div>
      <div class="text-[13px] text-ink-2 -mt-1">Rentang: <span class="money font-600">{{ dateLabel }}</span></div>

      <CoreCategoryPicker v-model:mat="mat" v-model:cover="cover" />
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <CoreButton variant="ghost" class="!px-[16px] !py-[10px] !text-[13.5px]" @click="ui.showNewTrip = false">Batal</CoreButton>
        <CoreButton variant="primary" class="!px-[18px] !py-[10px] !text-[13.5px]" @click="create">Buat trip</CoreButton>
      </div>
    </template>
  </CoreDialog>
</template>
