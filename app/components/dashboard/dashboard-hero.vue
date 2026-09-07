<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { matKey } from '~/utils/motifs'
import { rp, shortRp } from '~/utils/format'

const props = defineProps<{ trip: Trip }>()
const ui = useUiStore()
const { t } = useI18n()
const { budget, packing } = useDerived(() => props.trip)

const typeLabel = computed(() => `${t('cat.' + matKey(props.trip.mat))} · ${t('app.hero.people', { n: props.trip.people })}`)

const dayIdx = computed(() => Math.min(ui.dayIdx, props.trip.days.length - 1))
const dayLabel = computed(() => t('app.hero.dayLabel', { i: dayIdx.value + 1, n: props.trip.days.length }))

// two-tone progress: within-plan vs over
const bars = computed(() => {
  const { spent, plan } = budget.value
  const denom = Math.max(spent, plan, 1)
  const within = Math.min(spent, plan)
  const over = Math.max(0, spent - plan)
  return { a: (within / denom) * 100, b: (over / denom) * 100 }
})
const pctCopy = computed(() => Math.round(budget.value.pct) + '%')
const paceCopy = computed(() => (budget.value.over ? t('app.hero.overPace') : t('app.hero.okPace')))
const perHead = computed(() => rp(budget.value.perPerson))

// next activity of the current day
const nextAct = computed(() => {
  const acts = (props.trip.days[dayIdx.value]?.acts || [])
    .slice()
    .sort((a, b) => (a.time || '99').localeCompare(b.time || '99'))
  return acts.find((a) => a.cost > 0) || acts[0] || null
})
const nextActCopy = computed(() =>
  nextAct.value ? `${nextAct.value.time} · ${nextAct.value.title}` : t('app.hero.noAct'),
)
const nextActSub = computed(() =>
  nextAct.value ? `${nextAct.value.cost ? shortRp(nextAct.value.cost) + ' · ' : ''}${nextAct.value.cat}` : '',
)

function open(tab: string) {
  navigateTo(`/trip/${props.trip.id}/${tab}`)
}
</script>

<template>
  <div class="bg-white border border-sand-line rounded-hero flex flex-wrap overflow-hidden shadow-card">
    <!-- media -->
    <div class="w-full sm:w-[392px] sm:flex-[1_0_340px] min-h-[220px] sm:min-h-[300px] relative">
      <CoreCover :mat="trip.mat" :photo="trip.cover" :photo-size="184" :photo-border="7">
        <template #badge>
          <span class="bg-white rounded-pill px-[13px] py-[7px] text-[12px] font-700 text-teal-700">
            {{ dayLabel }}
          </span>
        </template>
      </CoreCover>
    </div>

    <!-- content -->
    <div class="flex-1 min-w-0 p-[24px_26px] flex flex-col gap-4">
      <div class="flex justify-between items-start gap-5">
        <div>
          <div class="flex gap-[9px] items-center">
            <CoreStatusPill status="live" />
            <span class="text-[13px] text-muted">{{ typeLabel }}</span>
          </div>
          <div class="font-display text-[30px] font-600 mt-[9px]">{{ trip.name }}</div>
          <div class="text-[14px] text-ink-2 mt-1">{{ trip.place }} · {{ trip.dates }}</div>
        </div>
        <div
          class="rounded-pill px-[15px] py-[9px] text-[13px] font-700 whitespace-nowrap money"
          :style="{ background: budget.statusBg, color: budget.statusFg }"
        >
          {{ budget.statusCopy }}
        </div>
      </div>

      <!-- budget: figure + bar together -->
      <div class="bg-paper rounded-card p-[16px_18px]">
        <div class="flex items-baseline justify-between gap-3 flex-wrap">
          <div class="flex items-baseline gap-2">
            <span class="eyebrow">{{ $t('app.hero.used') }}</span>
            <span class="money text-[26px] font-600" :style="{ color: budget.statusFg }">{{ rp(budget.spent) }}</span>
            <span class="text-[13px] text-muted money">/ {{ rp(budget.plan) }}</span>
          </div>
          <span class="money text-[13px] text-muted">{{ pctCopy }}</span>
        </div>
        <div class="h-[10px] rounded-pill bg-sand-100 overflow-hidden flex mt-[10px]">
          <div style="background:#F0713A" :style="{ width: bars.a + '%' }" />
          <div style="background:#C85A28" :style="{ width: bars.b + '%' }" />
        </div>
        <div class="text-[12.5px] text-muted mt-[6px]">{{ paceCopy }}</div>
      </div>

      <!-- compact secondary stats -->
      <div class="flex gap-3 flex-wrap">
        <div class="flex-1 min-w-[150px] bg-paper rounded-field px-[14px] py-[11px] flex items-center justify-between gap-2">
          <span class="eyebrow">{{ $t('app.hero.perPerson') }}</span>
          <span class="money text-[15px] font-600">{{ perHead }}</span>
        </div>
        <div class="flex-1 min-w-[150px] bg-paper rounded-field px-[14px] py-[11px] flex items-center justify-between gap-2">
          <span class="eyebrow">{{ $t('app.hero.packing') }}</span>
          <span class="money text-[15px] font-600">{{ packing.done }} / {{ packing.total }}</span>
        </div>
      </div>

      <!-- next activity on its own line -->
      <div class="mt-auto border-t border-sand-line pt-4 flex items-center gap-3">
        <div class="w-[40px] h-[40px] shrink-0 rounded-full bg-warn-bg flex items-center justify-center text-warn-fg">
          <i class="i-lucide-clock text-[19px]" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-[15px] font-600 truncate">{{ nextActCopy }}</div>
          <div class="text-[13px] text-muted mt-[1px] money">{{ nextActSub }}</div>
        </div>
      </div>

      <!-- buttons on their own line -->
      <div class="flex gap-[10px] flex-wrap">
        <CoreButton variant="primary" class="flex-1 min-w-[160px] !py-[12px] !text-[14px]" @click="open('expenses')">{{ $t('app.hero.logExpense') }}</CoreButton>
        <CoreButton variant="teal" class="flex-1 min-w-[130px] !bg-teal-100 !text-teal-700 !py-[12px] !text-[14px] hover:!bg-teal-deep" @click="open('overview')">{{ $t('app.hero.openTrip') }}</CoreButton>
      </div>
    </div>
  </div>
</template>
