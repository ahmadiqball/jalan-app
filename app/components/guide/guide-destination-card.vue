<script setup lang="ts">
import type { Destination } from '~/types/guide'

defineProps<{ destination: Destination }>()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink :to="localePath(`/guides/${destination.slug}`)" class="card overflow-hidden flex flex-col group hover:shadow-lift transition-shadow">
    <div
      class="h-[150px] bg-cover bg-center relative"
      :style="{ backgroundImage: destination.heroImage ? `url('${destination.heroImage}')` : undefined, backgroundColor: '#DEEEEC' }"
    >
      <div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(16,38,43,0) 42%,rgba(16,38,43,.55))" />
      <div class="absolute left-[14px] bottom-[11px] right-[14px]">
        <div class="font-display text-[21px] font-700 text-white leading-tight">{{ destination.name }}</div>
        <div class="text-[12.5px] text-white/85">{{ destination.region }}</div>
      </div>
    </div>
    <div class="p-[14px_16px] flex flex-col gap-[9px] flex-1">
      <p v-if="destination.summary" class="text-[12.5px] text-ink-2 leading-snug line-clamp-2">{{ destination.summary }}</p>
      <div v-if="destination.tripTypes?.length" class="flex gap-[6px] flex-wrap">
        <span v-for="t in destination.tripTypes.slice(0, 3)" :key="t" class="rounded-pill bg-paper text-ink-2 px-[9px] py-[3px] text-[11.5px] font-600">{{ t }}</span>
      </div>
      <div class="mt-auto pt-1 text-[12.5px] font-600 text-teal-700 flex items-center gap-1">Lihat panduan <i class="i-lucide-arrow-up-right text-[14px]" /></div>
    </div>
  </NuxtLink>
</template>
