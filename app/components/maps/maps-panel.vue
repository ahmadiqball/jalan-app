<script setup lang="ts">
import type { MapStop } from '~/composables/use-maps'

/**
 * Map panel (POC). Shows a free Maps embed when a key is set — a route through
 * the day's stops, or a single place — and always shows free "open in Maps"
 * deep links (which work with no key). Renders nothing if it has no place.
 */
const props = withDefaults(
  defineProps<{
    heading?: string
    /** single place, e.g. the trip destination (place mode) */
    single?: MapStop
    /** ordered stops, e.g. a day's activities (route mode when 2+) */
    stops?: (MapStop & { label: string })[]
    /** appended to text queries to disambiguate short names */
    context?: string
    /** draw a route through `stops` (day); false = single-place map (ringkasan) */
    route?: boolean
    height?: number
  }>(),
  { heading: 'Peta', route: true, height: 220 },
)

const { enabled, searchUrl, directionsUrl, placeEmbed, routeEmbed } = useMaps()

const list = computed(() => (props.stops || []).filter((s) => s.placeId || s.name?.trim()))
const firstStop = computed<MapStop | undefined>(() =>
  list.value[0] ? { name: list.value[0]!.name, placeId: list.value[0]!.placeId } : undefined,
)
// route mode (day) centers on the first activity; single mode (ringkasan) on the destination
const primary = computed<MapStop>(() =>
  (props.route ? firstStop.value ?? props.single : props.single ?? firstStop.value) ?? { name: '' },
)
const hasAny = computed(() => !!(primary.value.name || primary.value.placeId) || list.value.length > 0)
const isRoute = computed(() => props.route && list.value.length >= 2)

const src = computed(() =>
  isRoute.value ? routeEmbed(list.value, props.context) : placeEmbed(primary.value, props.context),
)
// route mode opens the whole day's route in Maps; else opens the single place
const openUrl = computed(() =>
  isRoute.value ? directionsUrl(list.value, props.context) : searchUrl(primary.value, props.context),
)
const openLabel = computed(() => (isRoute.value ? 'Buka rute di Maps' : 'Buka di Maps'))
</script>

<template>
  <div v-if="hasAny" class="card p-[16px_18px]">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <i class="i-lucide-map text-teal-600 text-[16px]" />
        <div class="font-display text-[16px] font-600">{{ heading }}</div>
      </div>
      <a :href="openUrl" target="_blank" rel="noopener" class="text-[12.5px] font-600 text-teal-600 hover:text-teal-700 flex items-center gap-1 shrink-0">
        {{ openLabel }} <i class="i-lucide-external-link text-[13px]" />
      </a>
    </div>

    <!-- embed when a key is set, else a friendly placeholder (links still work) -->
    <iframe
      v-if="enabled && src"
      :src="src"
      :style="{ height: height + 'px' }"
      class="w-full rounded-field border-0 mt-3"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      allowfullscreen
    />
    <div
      v-else
      class="mt-3 rounded-field border border-dashed border-sand-line3 bg-paper flex flex-col items-center justify-center text-center gap-1 p-4"
      :style="{ height: height + 'px' }"
    >
      <i class="i-lucide-map-pin text-[22px] text-muted" />
      <div class="text-[12.5px] text-muted max-w-[240px]">
        Pratinjau peta muncul saat kunci Google Maps dipasang. Link di bawah tetap jalan tanpa kunci.
      </div>
    </div>

    <!-- free deep links per stop -->
    <div v-if="list.length" class="flex flex-wrap gap-2 mt-3">
      <a
        v-for="(s, i) in list"
        :key="i"
        :href="searchUrl(s, context)"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-1 rounded-pill border border-sand-line2 px-[11px] py-[6px] text-[12.5px] text-ink-2 hover:border-teal-600 hover:text-teal-700 transition-colors max-w-full"
      >
        <i class="i-lucide-map-pin text-[13px] text-teal-600 shrink-0" />
        <span class="truncate">{{ s.label }}</span>
      </a>
    </div>
  </div>
</template>
