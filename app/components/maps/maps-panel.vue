<script setup lang="ts">
/**
 * Map panel (POC). Shows a free Maps embed when a key is configured — a route
 * through the given places, or a single place — and always shows free "open in
 * Maps" deep links (which work with no key). Renders nothing if it has no place.
 */
const props = withDefaults(
  defineProps<{
    heading?: string
    /** single place, e.g. the trip destination (place mode) */
    place?: string
    /** ordered stops, e.g. a day's activities (route mode when 2+) */
    places?: { label: string; query: string }[]
    /** appended to every query to disambiguate short names */
    context?: string
    /** draw a route through `places` (day view); false = single-place map (ringkasan) */
    route?: boolean
    height?: number
  }>(),
  { heading: 'Peta', route: true, height: 220 },
)

const { enabled, searchUrl, placeEmbed, routeEmbed } = useMaps()

const stops = computed(() => (props.places || []).filter((p) => p.query?.trim()))
const primary = computed(() => props.place?.trim() || stops.value[0]?.query || '')
const hasAny = computed(() => !!primary.value || stops.value.length > 0)

const src = computed(() => {
  if (props.route && stops.value.length >= 2) return routeEmbed(stops.value.map((s) => s.query), props.context)
  return placeEmbed(primary.value, props.context)
})
const openAllUrl = computed(() => searchUrl(primary.value, props.context))
</script>

<template>
  <div v-if="hasAny" class="card p-[16px_18px]">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <i class="i-lucide-map text-teal-600 text-[16px]" />
        <div class="font-display text-[16px] font-600">{{ heading }}</div>
      </div>
      <a :href="openAllUrl" target="_blank" rel="noopener" class="text-[12.5px] font-600 text-teal-600 hover:text-teal-700 flex items-center gap-1">
        Buka di Maps <i class="i-lucide-external-link text-[13px]" />
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
    <div v-if="stops.length" class="flex flex-wrap gap-2 mt-3">
      <a
        v-for="(s, i) in stops"
        :key="i"
        :href="searchUrl(s.query, context)"
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
