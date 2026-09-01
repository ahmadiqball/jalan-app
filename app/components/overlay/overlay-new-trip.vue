<script setup lang="ts">
import { rangeLabel } from '~/utils/format'
import { MATS } from '~/utils/motifs'
import { COVERS } from '~/utils/categories'

const ui = useUiStore()
const trips = useTripsStore()
const { flash } = useToast()

const name = ref('')
const place = ref('')
const mat = ref('pantai')
const cover = ref('')
const startIso = ref('')
const len = ref(4)

watch(
  () => ui.showNewTrip,
  (o) => {
    if (o) { name.value = ''; place.value = ''; mat.value = 'pantai'; cover.value = ''; startIso.value = ''; len.value = 4 }
  },
)

const open = computed({ get: () => ui.showNewTrip, set: (v: boolean) => (ui.showNewTrip = v) })
const dateLabel = computed(() => rangeLabel(startIso.value, len.value))
const matChoices = Object.entries(MATS).map(([key, def]) => ({ key, label: def.label, bg: def.bg }))
const coverChoices = [['', 'Tanpa gambar'] as [string, string], ...COVERS]

function create() {
  if (!name.value.trim()) return
  const id = trips.createTrip({
    name: name.value.trim(),
    place: place.value.trim(),
    mat: mat.value,
    cover: cover.value,
    startIso: startIso.value,
    len: Math.max(1, len.value),
    dates: rangeLabel(startIso.value, Math.max(1, len.value)) === 'belum diatur' ? '' : rangeLabel(startIso.value, Math.max(1, len.value)),
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
      <label class="flex flex-col gap-[6px]"><span class="eyebrow">Destinasi</span><input v-model="place" class="field" placeholder="mis. Waingapu, Sumba Timur"></label>

      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-[6px]"><span class="eyebrow">Tanggal mulai</span><CoreDatePicker v-model="startIso" /></label>
        <label class="flex flex-col gap-[6px]"><span class="eyebrow">Jumlah hari</span><input v-model.number="len" type="number" min="1" class="field money"></label>
      </div>
      <div class="text-[13px] text-ink-2 -mt-1">Rentang: <span class="money font-600">{{ dateLabel }}</span></div>

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

      <div>
        <span class="eyebrow">Gambar sampul</span>
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
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <CoreButton variant="ghost" class="!px-[16px] !py-[10px] !text-[13.5px]" @click="ui.showNewTrip = false">Batal</CoreButton>
        <CoreButton variant="primary" class="!px-[18px] !py-[10px] !text-[13.5px]" @click="create">Buat trip</CoreButton>
      </div>
    </template>
  </CoreDialog>
</template>
