<script setup lang="ts">
import type { Trip } from '~/types/domain'

const trips = useTripsStore()
const session = useSessionStore()
const { t } = useI18n()
const localePath = useLocalePath()
const { flash } = useToast()
const { rp } = useMoney()
const { templates } = useContent()
const cloud = useIsCloud()
const picks = computed(() => templates.value.slice(0, 3))

const total = (tp: Trip) => {
  const b = tp.budgets?.find((x) => x.id === tp.activeBudget) || tp.budgets?.[0]
  return Object.values(b?.alloc || {}).reduce((n, v) => n + v, 0) || tp.plan || 0
}

function use(tp: Trip) {
  const id = trips.cloneTrip(tp, { owner: cloud ? { name: session.name, email: session.email } : undefined })
  flash(t('app.templates.used'))
  navigateTo(`/trip/${id}/days`)
}
</script>

<template>
  <div v-if="picks.length" class="flex flex-col gap-4 mt-2">
    <div class="flex justify-between items-baseline">
      <div>
        <div class="font-display text-[20px] font-600">{{ $t('app.templates.startTitle') }}</div>
        <div class="text-[13.5px] text-muted mt-[2px]">{{ $t('app.templates.startSub') }}</div>
      </div>
      <NuxtLink :to="localePath('/template')" class="text-[13px] font-600 text-teal-600 shrink-0">{{ $t('app.templates.seeAll') }}</NuxtLink>
    </div>
    <div class="grid gap-[18px]" style="grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr))">
      <div v-for="tp in picks" :key="tp.id" class="bg-white border border-sand-line rounded-[20px] overflow-hidden flex flex-col">
        <div class="h-[96px] bg-cover bg-center" :style="tp.cover ? { backgroundImage: `url('${tp.cover}')` } : {}">
          <CoreCover v-if="!tp.cover" :mat="tp.mat" :photo-size="0" />
        </div>
        <div class="p-[15px_17px_17px] flex flex-col gap-[10px] flex-1">
          <div>
            <div class="font-display text-[18px] font-600">{{ tp.name }}</div>
            <div class="text-[12.5px] text-muted mt-[2px]">{{ tp.place || $t('app.templates.noDest') }}</div>
          </div>
          <div class="flex gap-[6px] text-[12px] font-600 flex-wrap">
            <span class="bg-paper rounded-pill px-[10px] py-[5px] text-ink-2 money">{{ $t('app.templates.days', { n: tp.days.length }) }}</span>
            <span class="bg-paper rounded-pill px-[10px] py-[5px] text-ink-2 money">{{ rp(total(tp)) }}</span>
          </div>
          <button class="mt-auto bg-teal-100 text-teal-700 rounded-pill py-[10px] text-[13px] font-700 hover:bg-teal-deep transition-colors" @click="use(tp)">
            {{ $t('app.templates.use') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
