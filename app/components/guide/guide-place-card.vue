<script setup lang="ts">
import type { Place } from '~/types/guide'
import { placeTypeLabel, placeTypeIcon, placeTypeToCat } from '~/utils/guide'
import { tone } from '~/utils/categories'

const props = defineProps<{ place: Place; slug: string }>()
const localePath = useLocalePath()
const { open } = useAddToTrip()
</script>

<template>
  <div class="card overflow-hidden flex flex-col group">
    <NuxtLink :to="localePath(`/guides/${slug}/${place.id}`)" class="block">
      <div
        class="h-[150px] bg-cover bg-center flex items-center justify-center relative"
        :style="place.gallery && place.gallery[0] ? { backgroundImage: `url('${place.gallery[0]}')` } : { background: tone(placeTypeToCat(place.type))[0] }"
      >
        <i v-if="!(place.gallery && place.gallery[0])" :class="placeTypeIcon(place.type)" class="text-[32px]" :style="{ color: tone(placeTypeToCat(place.type))[1] }" />
        <span v-if="place.badge" class="absolute top-[10px] left-[10px] rounded-pill bg-white/92 text-ink px-[10px] py-[4px] text-[11px] font-700 flex items-center gap-1 shadow">
          <i class="i-lucide-crown text-[12px] text-warn-fg" /> {{ place.badge }}
        </span>
      </div>
    </NuxtLink>
    <div class="p-[14px_16px] flex flex-col gap-[8px] flex-1">
      <div class="flex items-start justify-between gap-2">
        <NuxtLink :to="localePath(`/guides/${slug}/${place.id}`)" class="font-display text-[16.5px] font-600 leading-tight hover:text-teal-700">{{ place.name }}</NuxtLink>
      </div>
      <div class="flex items-center gap-2 text-[12px] text-muted flex-wrap">
        <span class="inline-flex items-center gap-1 rounded-pill bg-paper px-[9px] py-[3px] font-600"><i :class="placeTypeIcon(place.type)" class="text-[12px]" /> {{ placeTypeLabel(place.type) }}</span>
        <span v-if="place.area" class="truncate">· {{ place.area }}</span>
      </div>
      <p v-if="place.shortDesc" class="text-[12.5px] text-ink-2 leading-snug line-clamp-2">{{ place.shortDesc }}</p>
      <div class="mt-auto pt-1 flex items-center justify-between gap-2">
        <span v-if="place.priceText" class="money text-[12.5px] font-600 text-ink-2">{{ place.priceText }}</span>
        <button class="ml-auto text-[12.5px] font-600 text-teal-700 hover:text-teal-600 flex items-center gap-1" @click="open(place)">
          <i class="i-lucide-plus text-[14px]" /> Tambah
        </button>
      </div>
    </div>
  </div>
</template>
