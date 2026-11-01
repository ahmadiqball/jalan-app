<script setup lang="ts">
import { isBillingPeriod, isPlanId, PLANS, type BillingPeriod } from '#shared/utils/plans'

definePageMeta({ public: true })
const { t } = useI18n()
useHead({ title: () => t('billing.title') + ' · Kelana' })

const route = useRoute()
const session = useSessionStore()
const { sub } = useSubscription()

const period = ref<BillingPeriod>('1m')
const { busy, start } = useCheckout()

const planName = computed(() => (sub.value.plan ? PLANS[sub.value.plan].name : ''))
const until = computed(() => (sub.value.expiresAt
  ? new Date(sub.value.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  : ''))

onMounted(() => {
  const { plan, period: chosen } = route.query
  // came from a plan card before logging in: pick up where they left off
  if (session.authed && isPlanId(plan) && isBillingPeriod(chosen)) {
    period.value = chosen
    navigateTo({ query: {} }, { replace: true })
    start(plan, chosen)
  }
})
</script>

<template>
  <div class="flex-1 w-full max-w-[1200px] mx-auto p-[30px_16px_60px] md:p-[30px_32px_60px] flex flex-col gap-5 anim-rise">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="max-w-[560px]">
        <div class="font-display text-[32px] font-600">{{ $t('billing.title') }}</div>
        <p class="text-[15px] text-ink-2 mt-[5px]">{{ $t('billing.subtitle') }}</p>
      </div>
      <BillingPeriodSwitch v-model="period" />
    </div>

    <!-- session comes from localStorage, so this can only render on the client -->
    <ClientOnly>
      <div v-if="sub.status === 'active'" class="card p-[14px_18px] text-[13.5px] text-ink-2">
        {{ $t('billing.currentUntil', { plan: planName, date: until }) }}
      </div>
      <div v-else-if="sub.status === 'unlimited' && session.authed" class="card p-[14px_18px] text-[13.5px] text-ink-2">{{ $t('billing.unlimited') }}</div>
    </ClientOnly>

    <BillingPlanCards :period="period" :current="sub.plan" :busy="busy" @select="start($event, period)" />

    <BillingGuideInfo />

    <div class="text-[12.5px] text-ink-2 leading-[1.6]">{{ $t('billing.fineprint') }}</div>
  </div>
</template>
