<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { ofItems } from '~/utils/categories'
import { outfitDaySet } from '~/utils/derive'

const props = defineProps<{ trip: Trip; dayIdx: number }>()
const items = computed(() => ofItems(outfitDaySet(props.trip, props.dayIdx)))
</script>

<template>
  <div class="card p-[18px]">
    <div class="flex items-center justify-between">
      <div class="font-display text-[17px] font-600">Outfit hari ini</div>
      <NuxtLink :to="`/trip/${trip.id}/outfit`" class="text-[13px] font-600 text-teal-600">Ubah outfit</NuxtLink>
    </div>
    <div v-if="items.length" class="flex flex-col gap-[10px] mt-3">
      <div v-for="it in items" :key="it.label" class="flex items-center gap-3">
        <div class="w-[30px] h-[30px] rounded-[9px] bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
          <i :class="it.icon" class="text-[15px]" />
        </div>
        <div class="min-w-0">
          <div class="eyebrow !text-[10.5px]">{{ it.label }}</div>
          <div class="text-[13.5px] text-ink truncate">{{ it.value }}</div>
        </div>
      </div>
    </div>
    <div v-else class="text-[13.5px] text-muted mt-3">Belum diisi untuk hari ini.</div>
  </div>
</template>
