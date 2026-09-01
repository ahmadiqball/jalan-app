<script setup lang="ts">
import type { Day, Trip } from '~/types/domain'
import { rangeLabel, shortDate, longDate, addDays } from '~/utils/format'
import { MATS } from '~/utils/motifs'
import { COVERS } from '~/utils/categories'

const props = defineProps<{ trip: Trip }>()
const ui = useUiStore()
const trips = useTripsStore()
const { flash } = useToast()

const name = ref('')
const place = ref('')
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

const matChoices = Object.entries(MATS).map(([key, def]) => ({ key, label: def.label, bg: def.bg }))
const coverChoices = [['', 'Tanpa gambar'] as [string, string], ...COVERS]

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
    mat: mat.value,
    cover: cover.value,
    startIso: startIso.value,
    dates: rangeLabel(startIso.value, n) === 'belum diatur' ? props.trip.dates : rangeLabel(startIso.value, n),
    days,
  })
  ui.editOpen = false
  flash('Trip disimpan')
}
</script>

<template>
  <CoreDialog v-model:open="open" :width="440" title="Ubah detail trip">
    <div class="flex flex-col gap-4">
      <div>
        <span class="eyebrow">Gambar sampul</span>
        <div
          class="mt-2 h-[132px] rounded-card overflow-hidden flex items-center justify-center bg-cover bg-center"
          :style="{ backgroundImage: cover ? `url('${cover}')` : undefined, backgroundColor: MATS[mat]?.bg }"
        >
          <span v-if="!cover" class="text-[13px] text-teal-700">Belum ada gambar</span>
        </div>
        <div class="flex flex-wrap gap-2 mt-2">
          <button
            v-for="[url, label] in coverChoices"
            :key="url || 'none'"
            class="rounded-pill px-[11px] py-[6px] text-[12px] font-600 border transition-colors"
            :class="cover === url ? 'border-teal-600 text-teal-700 bg-teal-100' : 'border-sand-line text-muted hover:border-teal-600'"
            @click="cover = url"
          >
            {{ label }}
          </button>
        </div>
      </div>

      <label class="flex flex-col gap-[6px]"><span class="eyebrow">Nama trip</span><input v-model="name" class="field" placeholder="mis. Sumba Timur"></label>
      <label class="flex flex-col gap-[6px]"><span class="eyebrow">Destinasi</span><input v-model="place" class="field" placeholder="mis. Waingapu, Sumba Timur"></label>

      <div>
        <span class="eyebrow">Motif</span>
        <div class="flex flex-wrap gap-2 mt-2">
          <button
            v-for="m in matChoices"
            :key="m.key"
            class="rounded-pill px-[11px] py-[6px] text-[12px] font-600 border flex items-center gap-2 transition-colors"
            :class="mat === m.key ? 'border-teal-600 text-teal-700' : 'border-sand-line text-muted hover:border-teal-600'"
            @click="mat = m.key"
          >
            <span class="w-[12px] h-[12px] rounded-full" :style="{ background: m.bg }" />
            {{ m.label }}
          </button>
        </div>
      </div>

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
      <div class="flex justify-end gap-3">
        <CoreButton variant="ghost" class="!px-[16px] !py-[10px] !text-[13.5px]" @click="ui.editOpen = false">Batal</CoreButton>
        <CoreButton variant="primary" class="!px-[18px] !py-[10px] !text-[13.5px]" @click="save">Simpan</CoreButton>
      </div>
    </template>
  </CoreDialog>
</template>
