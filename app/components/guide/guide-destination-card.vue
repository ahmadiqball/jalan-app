<script setup lang="ts">
import type { Destination } from '~/types/guide'

defineProps<{ destination: Destination }>()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLink :to="localePath(`/guides/${destination.slug}`)" class="card overflow-hidden flex flex-col group hover:shadow-lift transition-shadow">
    <div
      class="h-[158px] bg-cover bg-center relative shrink-0"
      :style="{ backgroundImage: (destination.cardImage || destination.heroImage) ? `url('${destination.cardImage || destination.heroImage}')` : undefined, backgroundColor: '#DEEEEC' }"
    >
      <!-- FREE badge for featured/free guides (premium lock comes in the paywall phase) -->
      <span v-if="destination.featured" class="absolute top-[10px] right-[10px] rounded-pill bg-teal-600 text-white px-[10px] py-[4px] text-[10.5px] font-700 tracking-[.06em]">FREE</span>
    </div>

    <div class="p-[14px_16px] flex items-end gap-3 flex-1">
      <div class="flex-1 min-w-0">
        <div class="font-display text-[19px] font-700 leading-tight truncate">{{ destination.name }}</div>
        <div class="text-[12px] font-600 text-teal-700 mt-[2px]">
          {{ destination.idealDuration ? 'Itinerary ' + destination.idealDuration : destination.region }}
        </div>
        <p v-if="destination.summary" class="text-[12.5px] text-muted leading-snug line-clamp-2 mt-[6px]">{{ destination.summary }}</p>
      </div>
      <span class="w-[36px] h-[36px] rounded-full border border-teal-600 text-teal-700 flex items-center justify-center shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors">
        <i class="i-lucide-arrow-right text-[17px]" />
      </span>
    </div>
  </NuxtLink>
</template>
