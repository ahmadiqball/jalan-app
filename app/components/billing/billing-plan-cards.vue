<script setup lang="ts">
import { PLAN_LIST, PLANS, type BillingPeriod, type Plan, type PlanId } from '#shared/utils/plans'

const props = defineProps<{ period: BillingPeriod; current?: PlanId | null; busy?: string }>()
const emit = defineEmits<{ select: [PlanId] }>()
const { t } = useI18n()
const { rp } = useMoney()

function feats(p: Plan): string[] {
  return [
    p.maxTrips === 1 ? t('billing.feat.tripOne') : t('billing.feat.trips', { n: p.maxTrips }),
    t('billing.feat.members', { n: p.maxMembers }),
    t('billing.feat.tools'),
    p.maxBudgetVersions == null ? t('billing.feat.versions') : t('billing.feat.versionOne'),
    p.guides ? t('billing.feat.guides') : t('billing.feat.publicGuides'),
    ...(p.newsletter ? [t('billing.feat.newsletter')] : []),
  ]
}
const blocked = (p: Plan) => !!props.current && PLANS[props.current].rank > p.rank
function cta(p: Plan) {
  if (props.busy === p.id) return t('billing.opening')
  if (props.current === p.id) return t('billing.extend')
  return t('billing.choose')
}
</script>

<template>
  <div class="grid gap-[18px]" style="grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr))">
    <div v-for="p in PLAN_LIST" :key="p.id" class="rounded-hero p-[22px] flex flex-col gap-[15px] border-[1.5px]" :class="p.id === 'plus' ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-sand-line'">
      <div class="flex justify-between items-center gap-[10px]">
        <div class="text-[19px] font-800 tracking-[-.02em]">{{ p.name }}</div>
        <span v-if="current === p.id" class="bg-teal-100 text-teal-700 rounded-pill px-[11px] py-[5px] text-[11px] font-700 whitespace-nowrap">{{ $t('billing.active') }}</span>
        <span v-else-if="p.id === 'plus'" class="bg-primary text-white rounded-pill px-[11px] py-[5px] text-[11px] font-700 whitespace-nowrap">{{ $t('billing.popular') }}</span>
      </div>
      <div class="flex gap-[7px] items-baseline flex-wrap">
        <span class="font-mono text-[28px] font-600 tracking-[-.02em] whitespace-nowrap">{{ rp(p.prices[period]) }}</span>
        <span class="text-[13px]" :class="p.id === 'plus' ? 'text-teal-deep' : 'text-ink-2'">{{ $t('billing.per.' + period) }}</span>
      </div>
      <div class="flex flex-col gap-[9px]">
        <div v-for="f in feats(p)" :key="f" class="flex gap-[9px] items-start text-[13.5px] leading-[1.5]">
          <i class="i-lucide-check text-[15px] mt-[2px] shrink-0" :class="p.id === 'plus' ? 'text-teal-deep' : 'text-teal-600'" />
          <span>{{ f }}</span>
        </div>
      </div>
      <button
        class="mt-auto text-center rounded-pill py-[13px] text-[14px] font-700 disabled:opacity-50"
        :class="p.id === 'plus' ? 'bg-teal-600 text-white' : 'bg-teal-100 text-ink'"
        :disabled="!!busy || blocked(p)"
        @click="emit('select', p.id)"
      >
        {{ cta(p) }}
      </button>
    </div>
  </div>
</template>
