<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { matDef } from '~/utils/motifs'

const props = defineProps<{ trip: Trip }>()
const ui = useUiStore()
const { canEdit, isOwner } = useTripAccess()
const editable = computed(() => canEdit(props.trip))
const owner = computed(() => isOwner(props.trip))

const locked = computed(() => props.trip.status === 'live')
const typeLabel = computed(() => matDef(props.trip.mat).label)
const activeBudget = computed(
  () => props.trip.budgets.find((b) => b.id === props.trip.activeBudget) || props.trip.budgets[0],
)
const budgetChip = computed(() => {
  const name = activeBudget.value?.name || 'Rencana awal'
  return locked.value
    ? { copy: `${name} · terkunci`, bg: '#F1EEE1', fg: '#8A6314' }
    : { copy: `${name} · ${props.trip.budgets.length} versi`, bg: '#DEEEEC', fg: '#0A4F55' }
})
</script>

<template>
  <div class="bg-white border-b border-sand-line sticky top-[68px] z-30">
    <div class="max-w-[1400px] mx-auto p-[18px_20px_0] md:p-[18px_32px_0] flex flex-wrap gap-[18px] items-start">
      <NuxtLink
        to="/beranda"
        class="w-[34px] h-[34px] shrink-0 rounded-full bg-paper border border-sand-line2 flex items-center justify-center mt-1 hover:border-teal-600"
      >
        <i class="i-lucide-chevron-left text-[17px] text-ink-2" />
      </NuxtLink>

      <button
        class="w-[78px] h-[78px] shrink-0 rounded-[20px] overflow-hidden relative bg-cover"
        :style="{
          backgroundImage: trip.cover ? `url('${trip.cover}')` : undefined,
          backgroundPosition: 'center 58%',
          backgroundColor: matDef(trip.mat).bg,
        }"
        title="Ubah detail"
        :disabled="!editable"
        @click="editable && (ui.editOpen = true)"
      >
        <span v-if="editable" class="absolute right-[5px] bottom-[5px] w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-[0_4px_10px_-4px_rgba(16,38,43,.5)]">
          <i class="i-lucide-pencil text-[12px] text-teal-700" />
        </span>
      </button>

      <div class="flex-1 min-w-[220px]">
        <div class="flex flex-wrap gap-[9px] items-center">
          <CoreStatusPill :status="trip.status" />
          <span class="rounded-pill bg-teal-100 text-teal-700 px-[11px] py-[5px] text-[12px] font-700">{{ typeLabel }}</span>
          <NuxtLink
            :to="`/trip/${trip.id}/budget`"
            class="rounded-pill px-[11px] py-[5px] text-[12px] font-700"
            :style="{ background: budgetChip.bg, color: budgetChip.fg }"
          >
            {{ budgetChip.copy }}
          </NuxtLink>
          <span class="text-[13px] text-muted">{{ trip.people }} orang</span>
        </div>
        <div class="font-display text-[28px] font-600 mt-[7px]">{{ trip.name }}</div>
        <div class="text-[13.5px] text-ink-2 mt-[3px]">{{ trip.place }} · {{ trip.dates }}</div>
      </div>

      <div class="flex gap-[10px] items-center text-[13px] font-600 mt-1 flex-wrap">
        <span v-if="!editable" class="bg-sand-100 text-ink-2 rounded-pill px-[13px] py-2 flex items-center gap-[6px]">
          <i class="i-lucide-eye text-[14px]" />
          Hanya lihat
        </span>
        <button
          v-if="editable"
          class="flex gap-[6px] items-center bg-white border border-sand-line2 text-ink-2 rounded-pill px-[14px] py-2 hover:border-teal-600 hover:text-teal-700"
          @click="ui.editOpen = true"
        >
          <i class="i-lucide-pencil text-[14px]" />
          Ubah detail
        </button>
        <NuxtLink v-if="owner" :to="`/share/${trip.id}`" class="bg-white border border-sand-line2 text-ink-2 rounded-pill px-[14px] py-2 hover:border-teal-600">
          Bagikan tautan
        </NuxtLink>
        <NuxtLink v-if="editable" :to="`/trip/${trip.id}/expenses`" class="bg-primary text-white rounded-pill px-[16px] py-[9px] font-700 hover:bg-primary-hover">
          Catat pengeluaran
        </NuxtLink>
      </div>
    </div>

    <LayoutTabBar :trip-id="trip.id" />
  </div>
</template>
