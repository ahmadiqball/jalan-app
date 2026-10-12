<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { matDef, matKey } from '~/utils/motifs'
import { tripCover } from '~/utils/categories'

const props = defineProps<{ trip: Trip }>()
const ui = useUiStore()
const { t } = useI18n()
const localePath = useLocalePath()
const { canEdit, isOwner } = useTripAccess()
const editable = computed(() => canEdit(props.trip))
const owner = computed(() => isOwner(props.trip))

const locked = computed(() => props.trip.status === 'live')
const cover = computed(() => tripCover(props.trip))
const typeLabel = computed(() => t('cat.' + matKey(props.trip.mat)))
const activeBudget = computed(
  () => props.trip.budgets.find((b) => b.id === props.trip.activeBudget) || props.trip.budgets[0],
)
const budgetChip = computed(() => {
  const name = activeBudget.value?.name || 'Rencana awal'
  return locked.value
    ? { copy: `${name} · ${t('app.header.locked')}`, bg: '#F1EEE1', fg: '#8A6314' }
    : { copy: `${name} · ${t('app.header.versions', { n: props.trip.budgets.length })}`, bg: '#DEEEEC', fg: '#0A4F55' }
})
</script>

<template>
  <div data-trip-header class="bg-white border-b border-sand-line sticky top-[68px] z-30">
    <div class="max-w-[1400px] mx-auto p-[13px_16px_0] md:p-[18px_32px_0] flex flex-wrap gap-x-[14px] gap-y-[10px] md:gap-[18px] items-start">
      <NuxtLink
        :to="localePath('/beranda')"
        class="w-[34px] h-[34px] shrink-0 rounded-full bg-paper border border-sand-line2 flex items-center justify-center mt-1 hover:border-teal-600"
      >
        <i class="i-lucide-chevron-left text-[17px] text-ink-2" />
      </NuxtLink>

      <button
        class="w-[56px] h-[56px] md:w-[78px] md:h-[78px] shrink-0 rounded-[16px] md:rounded-[20px] overflow-hidden relative bg-cover"
        :style="{
          backgroundImage: cover ? `url('${cover}')` : undefined,
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

      <div class="flex-1 min-w-[150px] md:min-w-[220px]">
        <div class="flex flex-wrap gap-[7px] md:gap-[9px] items-center">
          <CoreStatusPill :status="trip.status" />
          <span class="rounded-pill bg-teal-100 text-teal-700 px-[11px] py-[5px] text-[12px] font-700">{{ typeLabel }}</span>
          <NuxtLink
            :to="localePath(`/trip/${trip.id}/budget`)"
            class="rounded-pill px-[11px] py-[5px] text-[12px] font-700"
            :style="{ background: budgetChip.bg, color: budgetChip.fg }"
          >
            {{ budgetChip.copy }}
          </NuxtLink>
          <span class="hidden sm:inline text-[13px] text-muted">{{ $t('app.header.people', { n: trip.people }) }}</span>
        </div>
        <div class="font-display text-[21px] md:text-[28px] font-600 mt-[5px] md:mt-[7px] leading-tight">{{ trip.name }}</div>
        <div class="text-[13px] md:text-[13.5px] text-ink-2 mt-[2px] md:mt-[3px]">{{ trip.place }} · {{ trip.dates }}</div>
      </div>

      <!-- actions: labels collapse to icons on mobile so they stay one row -->
      <div class="flex gap-[8px] md:gap-[10px] items-center text-[13px] font-600 mt-[2px] md:mt-1 flex-wrap ml-auto md:ml-0">
        <span v-if="!editable" class="bg-sand-100 text-ink-2 rounded-pill px-[11px] md:px-[13px] py-2 flex items-center gap-[6px]">
          <i class="i-lucide-eye text-[14px]" />
          <span class="hidden sm:inline">{{ $t('app.header.viewOnly') }}</span>
        </span>
        <button
          v-if="editable"
          class="flex gap-[6px] items-center bg-white border border-sand-line2 text-ink-2 rounded-pill px-[11px] md:px-[14px] py-2 hover:border-teal-600 hover:text-teal-700"
          :title="$t('app.header.edit')"
          @click="ui.editOpen = true"
        >
          <i class="i-lucide-pencil text-[14px]" />
          <span class="hidden sm:inline">{{ $t('app.header.edit') }}</span>
        </button>
        <button
          v-if="owner"
          class="bg-white border border-sand-line2 text-ink-2 rounded-pill px-[11px] md:px-[14px] py-2 hover:border-teal-600 flex items-center gap-[6px]"
          :title="$t('app.header.share')"
          @click="ui.shareOpen = true"
        >
          <i class="i-lucide-share-2 text-[14px]" />
          <span class="hidden sm:inline">{{ $t('app.header.share') }}</span>
        </button>
        <NuxtLink
          v-if="editable"
          :to="localePath(`/trip/${trip.id}/expenses`)"
          class="bg-primary text-white rounded-pill px-[13px] md:px-[16px] py-[9px] font-700 hover:bg-primary-hover flex items-center gap-[6px]"
          :title="$t('app.header.logExpense')"
        >
          <i class="i-lucide-receipt text-[15px]" />
          <span class="hidden sm:inline">{{ $t('app.header.logExpense') }}</span>
        </NuxtLink>
      </div>
    </div>

    <LayoutTabBar :trip-id="trip.id" />
  </div>
</template>
