<script setup lang="ts">
import type { Day, Trip } from '~/types/domain'
import { rangeLabel, shortDate, longDate, addDays } from '~/utils/format'
import { MATS, matKey } from '~/utils/motifs'

const props = defineProps<{ trip: Trip }>()
const ui = useUiStore()
const trips = useTripsStore()
const { flash } = useToast()
const { confirm } = useConfirm()
const { isOwner } = useTripAccess()
const { t } = useI18n()
const localePath = useLocalePath()

const canDelete = computed(() => isOwner(props.trip))

const name = ref('')
const place = ref('')
const placeId = ref<string | undefined>(undefined)
const mat = ref('pantai')
const cover = ref('')
const startIso = ref('')
const len = ref(1)

watch(
  () => ui.editOpen,
  (o) => {
    if (o) {
      name.value = props.trip.name
      place.value = props.trip.place
      placeId.value = props.trip.placeId
      mat.value = props.trip.mat
      cover.value = props.trip.cover
      startIso.value = props.trip.startIso || ''
      len.value = props.trip.days.length
    }
  },
  { immediate: true },
)

const open = computed({ get: () => ui.editOpen, set: (v: boolean) => (ui.editOpen = v) })
const dateLabel = computed(() => rangeLabel(startIso.value, len.value))
const daysWithActs = computed(() => props.trip.days.filter((d) => d.acts.length).length)
const reduceWarn = computed(() => len.value < daysWithActs.value)

function save() {
  const n = Math.max(1, len.value)
  const days: Day[] = []
  for (let i = 0; i < n; i++) {
    const existing = props.trip.days[i]
    const d = startIso.value ? addDays(startIso.value, i) : null
    days.push({
      date: d ? shortDate(d) : existing?.date || 'Hari ' + (i + 1),
      long: d ? longDate(d) : existing?.long || 'Hari ' + (i + 1),
      title: existing?.title ?? (i === 0 ? 'Tiba' : i === n - 1 && n > 1 ? 'Pulang' : 'Belum diberi nama'),
      outfit: existing?.outfit ?? '',
      acts: existing?.acts ?? [],
    })
  }
  trips.updateTrip(props.trip.id, {
    name: name.value.trim() || props.trip.name,
    place: place.value.trim() || props.trip.place,
    placeId: placeId.value,
    mat: mat.value,
    cover: cover.value,
    startIso: startIso.value,
    dates: rangeLabel(startIso.value, n) === 'belum diatur' ? props.trip.dates : rangeLabel(startIso.value, n),
    days,
  })
  ui.editOpen = false
  flash('Trip disimpan')
}

async function del() {
  const ok = await confirm({
    title: t('confirm.delTripTitle'),
    message: t('confirm.delTripMsg', { name: props.trip.name }),
    confirmLabel: t('confirm.delTripCta'),
    danger: true,
  })
  if (!ok) return
  const id = props.trip.id
  ui.editOpen = false
  // leave the trip page first, then remove — cloud sync issues the server DELETE
  await navigateTo(localePath('/beranda'))
  trips.deleteTrip(id)
  flash('Trip dihapus')
}
</script>

<template>
  <CoreDialog v-model:open="open" :width="440" title="Ubah detail trip">
    <div class="flex flex-col gap-4">
      <div>
        <span class="eyebrow">Pratinjau</span>
        <div
          class="mt-2 h-[132px] rounded-card overflow-hidden flex items-center justify-center bg-cover bg-center"
          :style="{ backgroundImage: cover ? `url('${cover}')` : undefined, backgroundColor: MATS[matKey(mat)]?.bg }"
        >
          <span v-if="!cover" class="text-[13px] text-teal-700">{{ $t('cat.' + matKey(mat)) }}</span>
        </div>
      </div>

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

      <CoreCategoryPicker v-model:mat="mat" v-model:cover="cover" />

      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-[6px]"><span class="eyebrow">Tanggal mulai</span><CoreDatePicker v-model="startIso" /></label>
        <label class="flex flex-col gap-[6px]"><span class="eyebrow">Jumlah hari</span><input v-model.number="len" type="number" min="1" class="field money"></label>
      </div>
      <div class="text-[13px] text-ink-2 -mt-2">Rentang: <span class="money font-600">{{ dateLabel }}</span></div>

      <div v-if="reduceWarn" class="bg-warn-bg text-warn-fg rounded-banner p-[10px_14px] text-[13px]">
        {{ daysWithActs }} hari sudah punya aktivitas. Mengurangi jadi {{ len }} hari akan menghapus hari terakhir beserta isinya.
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-3">
        <button
          v-if="canDelete"
          class="text-warn-fg text-[13.5px] font-600 flex items-center gap-2 hover:underline"
          @click="del"
        >
          <i class="i-lucide-trash-2 text-[15px]" /> Hapus trip
        </button>
        <span v-else />
        <div class="flex gap-3">
          <CoreButton variant="ghost" class="!px-[16px] !py-[10px] !text-[13.5px]" @click="ui.editOpen = false">Batal</CoreButton>
          <CoreButton variant="primary" class="!px-[18px] !py-[10px] !text-[13.5px]" @click="save">Simpan</CoreButton>
        </div>
      </div>
    </template>
  </CoreDialog>
</template>
