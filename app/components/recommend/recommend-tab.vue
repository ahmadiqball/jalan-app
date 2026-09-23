<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { REC_TYPES } from '~/types/content'
import { regionOf, placesForTrip, recTypeLabel, recTypeIcon, recTypeToCat } from '~/utils/recommend'
import { tone } from '~/utils/categories'

const props = defineProps<{ trip: Trip }>()
const trips = useTripsStore()
const { flash } = useToast()
const { regions, places } = useContent()
const { searchUrl } = useMaps()
const { canEdit } = useTripAccess()

const editable = computed(() => canEdit(props.trip))
const region = computed(() => regionOf(props.trip, regions.value))
const matched = computed(() => placesForTrip(props.trip, regions.value, places.value))

const regionOptions = computed(() => regions.value.map((r) => ({ value: r.id, label: r.label })))
function setRegion(id: string) {
  trips.updateTrip(props.trip.id, { region: id || undefined })
}

// type filters present among the matched places, in canonical order
const typeFilter = ref<string>('all')
const presentTypes = computed(() => REC_TYPES.filter((t) => matched.value.some((p) => p.type === t.id)))
const shown = computed(() =>
  typeFilter.value === 'all' ? matched.value : matched.value.filter((p) => p.type === typeFilter.value),
)

function priceDots(level?: number) {
  return level && level > 0 ? 'Rp'.repeat(Math.min(4, level)) : ''
}

function addToTrip(name: string, type: string) {
  const id = trips.addActivity(props.trip.id, 0, {
    time: '', title: name, cat: recTypeToCat(type), place: name, cost: 0, dur: 60, note: '',
  })
  void id
  flash(`"${name}" ditambahkan ke ${props.trip.days[0]?.date || 'Hari 1'}`)
}
</script>

<template>
  <div class="flex flex-col gap-4 anim-rise">
    <div class="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <div class="font-display text-[24px] font-600">Rekomendasi</div>
        <div class="text-[13.5px] text-muted mt-[3px]">
          <template v-if="region">Pilihan tempat di <span class="font-600 text-ink-2">{{ region.label }}</span></template>
          <template v-else>Pilih wilayah untuk melihat rekomendasi.</template>
        </div>
      </div>
      <!-- region shown/override, whenever regions exist -->
      <label v-if="regions.length" class="flex items-center gap-2">
        <span class="text-[12.5px] text-muted">Wilayah</span>
        <div class="w-[190px]"><CoreSelect :model-value="region?.id || ''" :options="regionOptions" @update:model-value="setRegion" /></div>
      </label>
    </div>

    <!-- no regions configured at all -->
    <div v-if="!regions.length" class="card p-[26px] text-center text-muted text-[13.5px]">
      Rekomendasi belum tersedia. Admin bisa menambahkannya lewat halaman Admin.
    </div>

    <!-- destination didn't resolve and user hasn't picked a region -->
    <div v-else-if="!region" class="card p-[26px] text-center flex flex-col items-center gap-3">
      <div class="w-[46px] h-[46px] rounded-full bg-sand-100 flex items-center justify-center"><i class="i-lucide-map-pin-off text-[20px] text-muted" /></div>
      <div class="text-[14px] font-600">Belum kenal daerah “{{ trip.place }}”</div>
      <div class="text-[12.5px] text-muted max-w-[320px]">Pilih wilayah terdekat di atas — pilihanmu tersimpan untuk trip ini.</div>
    </div>

    <template v-else>
      <!-- type filter -->
      <div v-if="presentTypes.length > 1" class="flex gap-2 flex-wrap">
        <button
          class="rounded-pill px-[13px] py-[7px] text-[12.5px] font-600 border transition-colors"
          :class="typeFilter === 'all' ? 'border-teal-600 bg-teal-100 text-teal-700' : 'border-sand-line text-muted hover:border-teal-600'"
          @click="typeFilter = 'all'"
        >Semua</button>
        <button
          v-for="t in presentTypes"
          :key="t.id"
          class="rounded-pill px-[13px] py-[7px] text-[12.5px] font-600 border transition-colors flex items-center gap-[6px]"
          :class="typeFilter === t.id ? 'border-teal-600 bg-teal-100 text-teal-700' : 'border-sand-line text-muted hover:border-teal-600'"
          @click="typeFilter = t.id"
        >
          <i :class="t.icon" class="text-[14px]" /> {{ t.label }}
        </button>
      </div>

      <div v-if="!shown.length" class="card p-[26px] text-center text-muted text-[13.5px]">Belum ada tempat di kategori ini.</div>

      <div v-else class="grid gap-[16px]" style="grid-template-columns:repeat(auto-fill,minmax(min(260px,100%),1fr))">
        <div v-for="p in shown" :key="p.id" class="card overflow-hidden flex flex-col">
          <!-- image, or a typed-icon tile fallback -->
          <div class="h-[128px] bg-cover bg-center flex items-center justify-center" :style="p.image ? { backgroundImage: `url('${p.image}')` } : { background: tone(recTypeToCat(p.type))[0] }">
            <i v-if="!p.image" :class="recTypeIcon(p.type)" class="text-[30px]" :style="{ color: tone(recTypeToCat(p.type))[1] }" />
          </div>
          <div class="p-[14px_16px] flex flex-col gap-[8px] flex-1">
            <div class="flex items-start justify-between gap-2">
              <div class="font-display text-[16.5px] font-600 leading-tight">{{ p.name }}</div>
              <span v-if="priceDots(p.priceLevel)" class="money text-[12px] text-teal-700 font-700 shrink-0">{{ priceDots(p.priceLevel) }}</span>
            </div>
            <div class="flex items-center gap-2 text-[12px] text-muted">
              <span class="inline-flex items-center gap-1 rounded-pill bg-paper px-[9px] py-[3px] font-600"><i :class="recTypeIcon(p.type)" class="text-[12px]" /> {{ recTypeLabel(p.type) }}</span>
              <span v-if="p.area" class="truncate">· {{ p.area }}</span>
            </div>
            <p v-if="p.note" class="text-[12.5px] text-ink-2 leading-snug">{{ p.note }}</p>
            <div class="mt-auto pt-1 flex items-center gap-2 flex-wrap">
              <a :href="searchUrl({ name: p.name }, trip.place)" target="_blank" rel="noopener" class="text-[12.5px] font-600 text-teal-600 hover:text-teal-700 flex items-center gap-1">
                <i class="i-lucide-map-pin text-[13px]" /> Maps
              </a>
              <a v-if="p.url" :href="p.url" target="_blank" rel="noopener" class="text-[12.5px] font-600 text-teal-600 hover:text-teal-700 flex items-center gap-1">
                <i class="i-lucide-external-link text-[13px]" /> Situs
              </a>
              <button v-if="editable" class="ml-auto text-[12.5px] font-600 text-ink-2 hover:text-teal-700 flex items-center gap-1" @click="addToTrip(p.name, p.type)">
                <i class="i-lucide-plus text-[14px]" /> Tambah
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
