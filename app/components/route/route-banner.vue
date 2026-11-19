<script setup lang="ts">
import type { Trip } from '~/types/domain'

/**
 * A Rute Kelana route as a wide banner for the home page carousel: the photo
 * fills the card, the route name sits large in the middle, and the price per
 * person, a short intro and a "Baca rutenya" button sit along the bottom.
 */
const props = defineProps<{ route: Trip }>()
const { rp } = useMoney()
const localePath = useLocalePath()
const to = computed(() => localePath(`/rute/${routeSlug(props.route)}`))
const blurb = computed(() => props.route.story?.intro || routeLength(props.route))
</script>

<template>
  <NuxtLink
    :to="to"
    class="route-banner group relative isolate flex flex-col overflow-hidden rounded-[24px] bg-ink text-white hover:text-white focus-visible:text-white aspect-[4/5] sm:aspect-[16/10] lg:aspect-[19/10] shadow-card transition-shadow duration-500 hover:shadow-[0_24px_48px_-16px_rgba(16,38,43,.45)]"
  >
    <img
      v-if="route.cover"
      :src="route.cover"
      alt=""
      loading="lazy"
      class="absolute inset-0 z-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
    >
    <CoreCover v-else :mat="route.mat" :photo-size="0" class="!absolute inset-0 z-0" />
    <!-- a light veil for the big title, darker at the bottom for the small text -->
    <div
      class="absolute inset-0 z-[1]"
      style="background:linear-gradient(180deg,rgba(16,38,43,.28) 0%,rgba(16,38,43,.12) 35%,rgba(16,38,43,.45) 65%,rgba(16,38,43,.9) 100%)"
      aria-hidden="true"
    />

    <div class="relative z-[2] flex flex-col h-full p-[18px] md:p-[24px]">
      <span class="text-[12px] font-600 text-white/85 flex items-center gap-[5px] min-w-0">
        <i class="i-lucide-map-pin text-[13px] shrink-0" aria-hidden="true" />
        <span class="truncate">{{ route.place || $t('app.templates.noDest') }}</span>
      </span>

      <!-- the route name, large in the middle -->
      <div class="flex-1 flex items-center justify-center min-h-0 px-2">
        <h3 class="route-banner-title font-display font-700 text-center leading-[.95] tracking-[-.025em]">{{ route.name }}</h3>
      </div>

      <div class="flex flex-col gap-[14px] sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div class="min-w-0 max-w-[52ch]">
          <p class="font-display text-[20px] md:text-[24px] font-600 leading-[1.15] money">{{ $t('app.templates.perPerson', { price: rp(routePerPerson(route)) }) }}</p>
          <p class="text-[13px] md:text-[14px] text-white/85 leading-[1.5] mt-[6px] line-clamp-2">{{ blurb }}</p>
        </div>
        <span
          class="shrink-0 rounded-pill bg-white text-ink text-[14px] font-700 px-[22px] min-h-[44px] inline-flex items-center justify-center gap-[6px] transition-colors duration-300 group-hover:bg-primary group-hover:text-white group-focus-visible:bg-primary group-focus-visible:text-white"
        >
          {{ $t('app.templates.read') }}
          <i class="i-lucide-arrow-right text-[15px] transition-transform duration-300 group-hover:translate-x-[3px] motion-reduce:group-hover:translate-x-0" aria-hidden="true" />
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
/* the title scales with the card's own width, so long names still fit */
.route-banner { container-type: inline-size; }
.route-banner-title {
  font-size: clamp(34px, 10.5cqi, 104px);
  text-wrap: balance;
  text-shadow: 0 2px 24px rgba(16, 38, 43, 0.35);
}
.route-banner:focus-visible { outline: 3px solid #0e6e76; outline-offset: 3px; }
</style>
