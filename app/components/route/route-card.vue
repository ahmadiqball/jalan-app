<script setup lang="ts">
import type { Trip } from '~/types/domain'

/**
 * A Rute Kelana route as a full-bleed photo card that opens its story page:
 * the cover fills the card, and the name, a short intro, two fact chips and
 * a "Baca rutenya" button sit on a dark gradient at the bottom.
 */
const props = withDefaults(defineProps<{ route: Trip; compact?: boolean }>(), { compact: false })
const { rp } = useMoney()
const localePath = useLocalePath()
const to = computed(() => localePath(`/rute/${routeSlug(props.route)}`))
</script>

<template>
  <NuxtLink
    :to="to"
    class="group relative isolate flex flex-col justify-end overflow-hidden rounded-[24px] bg-ink text-white hover:text-white focus-visible:text-white shadow-card transition-shadow duration-500 hover:shadow-[0_24px_48px_-16px_rgba(16,38,43,.45)] focus-visible:shadow-[0_24px_48px_-16px_rgba(16,38,43,.45)]"
    :class="compact ? 'aspect-[4/3.6]' : 'aspect-[4/5] md:aspect-[16/10]'"
  >
    <!-- the photo fills the card -->
    <img
      v-if="route.cover"
      :src="route.cover"
      :alt="route.name"
      loading="lazy"
      class="absolute inset-0 z-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
    >
    <CoreCover v-else :mat="route.mat" :photo-size="0" class="!absolute inset-0 z-0" />
    <!-- dark at the bottom so white text always reads -->
    <div class="absolute inset-0 z-[1]" style="background:linear-gradient(180deg,rgba(16,38,43,0) 28%,rgba(16,38,43,.55) 55%,rgba(16,38,43,.92) 100%)" aria-hidden="true" />

    <div class="relative z-[2] flex flex-col p-[18px] pt-0" :class="compact ? '' : 'md:p-[26px] md:pt-0'">
      <h3 class="font-display font-600 leading-[1.1] tracking-[-.01em]" :class="compact ? 'text-[20px]' : 'text-[24px] md:text-[30px]'">{{ route.name }}</h3>
      <div class="text-[13px] text-white/80 mt-[5px] flex items-center gap-[5px] min-w-0">
        <i class="i-lucide-map-pin text-[13px] shrink-0" aria-hidden="true" />
        <span class="truncate">{{ route.place || $t('app.templates.noDest') }}</span>
      </div>
      <p v-if="route.story?.intro && !compact" class="text-[13.5px] md:text-[14.5px] text-white/85 leading-[1.5] line-clamp-2 mt-[10px] max-w-[56ch]">{{ route.story.intro }}</p>

      <!-- wide screens: chips and button share one row -->
      <div class="flex flex-col" :class="compact ? '' : 'md:flex-row md:items-center md:justify-between md:gap-4 md:mt-[16px]'">
      <div class="flex flex-wrap gap-[6px] mt-[12px]" :class="compact ? '' : 'md:mt-0'">
        <span class="inline-flex items-center gap-[5px] rounded-pill bg-white/16 backdrop-blur-sm border border-white/20 px-[10px] py-[5px] text-[12px] font-600 money">
          <i class="i-lucide-calendar-days text-[13px]" aria-hidden="true" /> {{ routeLength(route) }}
        </span>
        <span class="inline-flex items-center gap-[5px] rounded-pill bg-white/16 backdrop-blur-sm border border-white/20 px-[10px] py-[5px] text-[12px] font-600 money">
          <i class="i-lucide-wallet text-[13px]" aria-hidden="true" /> ± {{ rp(routePerPerson(route)) }}/orang
        </span>
      </div>

      <span
        class="mt-[14px] w-full rounded-pill bg-white text-ink text-[14px] font-700 py-[12px] min-h-[44px] flex items-center justify-center gap-[6px] transition-colors duration-300 group-hover:bg-primary group-hover:text-white group-focus-visible:bg-primary group-focus-visible:text-white"
        :class="compact ? '' : 'md:mt-0 md:w-auto md:px-[26px] md:shrink-0'"
      >
        {{ $t('app.templates.read') }}
        <i class="i-lucide-arrow-right text-[15px] transition-transform duration-300 group-hover:translate-x-[3px]" aria-hidden="true" />
      </span>
      </div>
    </div>
  </NuxtLink>
</template>
