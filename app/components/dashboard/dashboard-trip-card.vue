<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { rp } from '~/utils/format'
import { matDef } from '~/utils/motifs'
import { tripCover } from '~/utils/categories'

const props = defineProps<{ trip: Trip }>()
const { t } = useI18n()
const cover = computed(() => tripCover(props.trip))

const actCount = computed(() => (props.trip.days || []).reduce((n, d) => n + (d.acts?.length || 0), 0))
const packAll = computed(() => (props.trip.packing || []).flatMap((g) => g.items))
const packCopy = computed(() =>
  packAll.value.length
    ? t('app.card.packing', { done: packAll.value.filter((i) => i.done).length, total: packAll.value.length })
    : t('app.card.noItems'),
)
const badgeColor = computed(() => {
  const map = { live: '#0A4F55', plan: '#33474C', draft: '#6C7C7D', template: '#33474C' } as const
  return map[props.trip.status]
})
</script>

<template>
  <NuxtLink
    :to="`/trip/${trip.id}/overview`"
    class="group relative bg-white border border-sand-line rounded-[24px] overflow-hidden cursor-pointer block shadow-[0_14px_30px_-24px_rgba(16,38,43,.35)] transition-all hover:-translate-y-[2px] hover:shadow-[0_20px_38px_-22px_rgba(16,38,43,.45)]"
  >
    <!-- decorative strip -->
    <div class="h-[132px] relative">
      <CoreCover :mat="trip.mat" :photo-size="0">
        <template #badge>
          <span class="bg-white rounded-pill px-[11px] py-[6px] text-[11px] font-700" :style="{ color: badgeColor }">
            {{ $t('status.' + trip.status) }}
          </span>
        </template>
      </CoreCover>
    </div>

    <!-- circular photo straddling the boundary (above both strip and body) -->
    <div
      class="absolute left-1/2 -translate-x-1/2 top-[80px] z-[3] w-[104px] h-[104px] rounded-full overflow-hidden border-[6px] border-white bg-cover bg-center bg-white flex items-center justify-center shadow-[0_12px_24px_-14px_rgba(16,38,43,.45)]"
      :style="{ backgroundImage: cover ? `url('${cover}')` : undefined, backgroundColor: matDef(trip.mat).bg }"
    >
      <i v-if="!cover" class="i-lucide-map-pin text-[30px] text-teal-600" />
    </div>

    <div class="p-[62px_20px_20px] flex flex-col gap-3 text-center">
      <div>
        <div class="font-display text-[20px] font-600">{{ trip.name }}</div>
        <div class="text-[13px] text-muted mt-1">{{ trip.place }}</div>
      </div>
      <div class="flex justify-center gap-2 text-[12px] font-600 flex-wrap">
        <span class="bg-paper rounded-pill px-3 py-[6px] text-ink-2 money">{{ trip.dates || $t('app.card.notSet') }}</span>
        <span class="bg-paper rounded-pill px-3 py-[6px] text-ink-2">{{ $t('app.card.activities', { n: actCount }) }}</span>
      </div>
      <div class="border-t border-sand-line pt-[13px] flex justify-between items-center">
        <div class="text-left">
          <div class="eyebrow">{{ $t('app.card.plan') }}</div>
          <div class="money text-[17px] font-600 mt-[2px]">{{ rp(trip.plan) }}</div>
        </div>
        <div class="text-[12px] text-muted money text-right">{{ packCopy }}</div>
      </div>
    </div>
  </NuxtLink>
</template>
