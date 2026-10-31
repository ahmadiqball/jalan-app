<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { matKey } from '~/utils/motifs'

const props = defineProps<{ trip: Trip }>()
const ui = useUiStore()
const { t } = useI18n()
const localePath = useLocalePath()
const { canEdit, isOwner } = useTripAccess()
const { isLocked } = useSubscription()
const editable = computed(() => canEdit(props.trip))
const owner = computed(() => isOwner(props.trip))

const locked = computed(() => props.trip.status === 'live')
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
  <div data-trip-header class="bg-white border-b border-sand-line md:sticky md:top-[68px] z-30">
    <NuxtLink v-if="isLocked(trip.id)" :to="localePath('/langganan')" class="flex items-center justify-center gap-2 bg-warn-bg text-warn-fg px-4 py-[8px] text-[12.5px] font-600 text-center">
      <i class="i-lucide-lock text-[14px] shrink-0" /> {{ $t('billing.lockedTrip') }}
    </NuxtLink>
    <div class="max-w-[1400px] mx-auto p-[12px_16px_0] md:p-[18px_32px_0] flex flex-wrap gap-x-[12px] gap-y-[8px] md:gap-[16px] items-center">
      <NuxtLink
        :to="localePath('/beranda')"
        class="w-[34px] h-[34px] shrink-0 rounded-full bg-paper border border-sand-line2 flex items-center justify-center hover:border-teal-600"
      >
        <i class="i-lucide-chevron-left text-[17px] text-ink-2" />
      </NuxtLink>

      <div class="flex-1 min-w-[150px] md:min-w-[220px] order-2 md:order-none w-full md:w-auto">
        <div class="font-display text-[20px] md:text-[27px] font-600 leading-tight truncate">{{ trip.name }}</div>
        <div class="flex items-center gap-[7px] flex-wrap text-[12.5px] md:text-[13px] text-ink-2 mt-[2px]">
          <span class="truncate">{{ trip.place }} · {{ trip.dates }}</span>
          <span class="hidden sm:inline text-muted">· {{ $t('app.header.people', { n: trip.people }) }}</span>
        </div>
        <!-- status / type / budget: a quiet chip row under the title -->
        <div class="flex flex-wrap gap-[6px] items-center mt-[7px]">
          <CoreStatusPill :status="trip.status" />
          <span class="rounded-pill bg-teal-100 text-teal-700 px-[10px] py-[4px] text-[11.5px] font-700">{{ typeLabel }}</span>
          <NuxtLink
            :to="localePath(`/trip/${trip.id}/budget`)"
            class="rounded-pill px-[10px] py-[4px] text-[11.5px] font-700"
            :style="{ background: budgetChip.bg, color: budgetChip.fg }"
          >
            {{ budgetChip.copy }}
          </NuxtLink>
        </div>
      </div>

      <!-- actions: labels collapse to icons on mobile so they stay one row -->
      <div class="flex gap-[8px] md:gap-[10px] items-center text-[13px] font-600 mt-[2px] md:mt-1 flex-wrap ml-auto md:ml-0">
        <span v-if="!editable" class="bg-sand-100 text-ink-2 rounded-pill px-[11px] md:px-[13px] py-2 flex items-center gap-[6px]">
          <i class="i-lucide-eye text-[14px]" />
          <span>{{ $t('app.header.viewOnly') }}</span>
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
