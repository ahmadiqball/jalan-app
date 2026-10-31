<script setup lang="ts">
definePageMeta({ public: true })
const { t } = useI18n()
useHead({ title: () => t('billing.title') + ' · Kelana' })

const route = useRoute()
const session = useSessionStore()
const localePath = useLocalePath()
const { flash } = useToast()
const { apiFetch } = useApi()
const { sub, refresh } = useSubscription()

const period = ref<BillingPeriod>('1m')
const busy = ref('')
const checking = ref(false)

const planName = computed(() => (sub.value.plan ? PLANS[sub.value.plan].name : ''))
const until = computed(() => (sub.value.expiresAt
  ? new Date(sub.value.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  : ''))

async function choose(plan: PlanId) {
  if (!session.authed) return navigateTo(localePath(`/masuk?next=${encodeURIComponent('/langganan')}`))
  busy.value = plan
  try {
    const { redirectUrl } = await apiFetch<{ redirectUrl: string }>('/api/billing/checkout', { method: 'POST', body: { plan, period: period.value } })
    window.location.href = redirectUrl
  } catch (e) {
    busy.value = ''
    flash((e as { data?: { message?: string } }).data?.message || t('billing.failed'))
  }
}

/** Back from Midtrans: the webhook activates the plan, usually within seconds. */
async function awaitOrder(id: string) {
  checking.value = true
  try {
    for (let i = 0; i < 6; i++) {
      const { status } = await apiFetch<{ status: string }>(`/api/billing/orders/${encodeURIComponent(id)}`)
      if (status === 'paid') {
        await refresh()
        flash(t('billing.paid'))
        return
      }
      if (status === 'failed') {
        flash(t('billing.notPaid'))
        return
      }
      await new Promise((r) => setTimeout(r, 2000))
    }
    flash(t('billing.pending'))
  } catch {
    flash(t('billing.pending'))
  } finally {
    checking.value = false
  }
}

onMounted(() => {
  const id = route.query.order_id
  if (session.authed && typeof id === 'string') awaitOrder(id)
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

    <div v-if="checking" class="card p-[14px_18px] text-[13.5px] text-ink-2 flex items-center gap-2">
      <i class="i-lucide-loader-circle animate-spin text-teal-600 text-[17px]" /> {{ $t('billing.checking') }}
    </div>
    <!-- session comes from localStorage, so this can only render on the client -->
    <ClientOnly>
      <div v-if="sub.status === 'active'" class="card p-[14px_18px] text-[13.5px] text-ink-2">
        {{ $t('billing.currentUntil', { plan: planName, date: until }) }}
      </div>
      <div v-else-if="sub.status === 'unlimited' && session.authed" class="card p-[14px_18px] text-[13.5px] text-ink-2">{{ $t('billing.unlimited') }}</div>
    </ClientOnly>

    <BillingPlanCards :period="period" :current="sub.plan" :busy="busy" @select="choose" />

    <div class="text-[12.5px] text-ink-2 leading-[1.6]">{{ $t('billing.fineprint') }}</div>
  </div>
</template>
