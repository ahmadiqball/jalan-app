<script setup lang="ts">
import type { Trip } from '~/types/domain'

/** A Rute Kelana route as a card that opens its story page. */
const props = withDefaults(defineProps<{ route: Trip; compact?: boolean }>(), { compact: false })
const { rp } = useMoney()
const localePath = useLocalePath()
const to = computed(() => localePath(`/rute/${routeSlug(props.route)}`))
</script>

<template>
  <NuxtLink
    :to="to"
    class="group bg-white border border-sand-line rounded-[22px] overflow-hidden flex flex-col transition-[transform,box-shadow] duration-200 hover:-translate-y-[2px] hover:shadow-lift focus-visible:-translate-y-[2px]"
  >
    <div class="overflow-hidden" :class="compact ? 'h-[120px]' : 'h-[168px]'">
      <div v-if="route.cover" class="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]" :style="{ backgroundImage: `url('${route.cover}')` }" />
      <CoreCover v-else :mat="route.mat" :photo-size="0" />
    </div>
    <div class="p-[16px_18px_18px] flex flex-col gap-[11px] flex-1">
      <div>
        <h3 class="font-display font-600" :class="compact ? 'text-[18px]' : 'text-[19px]'">{{ route.name }}</h3>
        <div class="text-[13px] text-muted mt-[3px]">{{ route.place || $t('app.templates.noDest') }}</div>
      </div>
      <p v-if="route.story?.intro && !compact" class="text-[13.5px] text-ink-2 leading-[1.5] line-clamp-2">{{ route.story.intro }}</p>
      <div class="flex gap-[7px] text-[12px] font-600 flex-wrap">
        <span class="bg-paper rounded-pill px-[11px] py-[6px] text-ink-2 money">{{ $t('app.templates.days', { n: route.days.length }, route.days.length) }}</span>
        <span class="bg-paper rounded-pill px-[11px] py-[6px] text-ink-2 money">± {{ rp(routePerPerson(route)) }}/orang</span>
      </div>
      <span class="mt-auto pt-1 text-[13.5px] font-700 text-teal-700 flex items-center gap-1">
        {{ $t('app.templates.read') }}
        <i class="i-lucide-arrow-right text-[15px] transition-transform duration-200 group-hover:translate-x-[3px]" aria-hidden="true" />
      </span>
    </div>
  </NuxtLink>
</template>
