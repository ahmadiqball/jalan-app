<script setup lang="ts">
import { isTripActive, PERIOD_LABELS, PLANS, type BillingPeriod, type PlanId } from '#shared/utils/plans'

const { t } = useI18n()
useHead({ title: () => t('billing.mine.title') + ' · Kelana' })

interface Order { id: string; plan: PlanId; period: BillingPeriod; amount: number; status: 'pending' | 'paid' | 'failed'; paymentType: string | null; createdAt: string; paidAt: string | null }

const localePath = useLocalePath()
const trips = useTripsStore()
const session = useSessionStore()
const { apiFetch } = useApi()
const { flash } = useToast()
const { confirm } = useConfirm()
const { rp } = useMoney()
const { sub, refresh } = useSubscription()

const orders = ref<Order[]>([])
const loading = ref(true)
const cancelling = ref(false)

const plan = computed(() => (sub.value.plan ? PLANS[sub.value.plan] : null))
const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '–')
const activeTrips = computed(() => trips.userTrips.filter((x) => tripRole(x, session.email) === 'owner' && isTripActive(x)).length)
const methodLabel = (o: Order) => (o.paymentType ? o.paymentType.replace(/_/g, ' ').toUpperCase() : '–')

async function load() {
  loading.value = true
  try {
    orders.value = await apiFetch<Order[]>('/api/billing/orders')
  } catch {
    flash(t('billing.mine.loadFailed'))
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function cancel() {
  const ok = await confirm({
    title: t('billing.mine.cancelTitle'),
    message: t('billing.mine.cancelMsg', { date: fmtDate(sub.value.expiresAt) }),
    confirmLabel: t('billing.mine.cancelCta'),
    danger: true,
  })
  if (!ok) return
  cancelling.value = true
  try {
    await apiFetch('/api/billing/cancel', { method: 'POST' })
    await refresh()
    flash(t('billing.mine.cancelled'))
  } catch {
    flash(t('billing.mine.cancelFailed'))
  } finally {
    cancelling.value = false
  }
}
</script>

<template>
  <div class="flex-1 w-full max-w-[860px] mx-auto p-[30px_16px_60px] md:p-[30px_32px_60px] flex flex-col gap-5 anim-rise">
    <div class="font-display text-[32px] font-600">{{ $t('billing.mine.title') }}</div>

    <!-- current plan -->
    <div v-if="plan" class="card p-[20px] flex flex-col gap-4">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[19px] font-800">{{ plan.name }}</span>
            <span class="rounded-pill px-[10px] py-[4px] text-[11px] font-700" :class="sub.cancelledAt ? 'bg-warn-bg text-warn-fg' : 'bg-teal-100 text-teal-700'">
              {{ sub.cancelledAt ? $t('billing.mine.statusCancelled') : $t('billing.active') }}
            </span>
          </div>
          <div class="text-[13.5px] text-ink-2 mt-[5px]">{{ $t(sub.cancelledAt ? 'billing.mine.endsOn' : 'billing.mine.activeUntil', { date: fmtDate(sub.expiresAt) }) }}</div>
        </div>
        <NuxtLink :to="localePath('/langganan')"><CoreButton variant="primary" class="!px-[16px] !py-[10px] !text-[13.5px]">{{ $t('billing.mine.manage') }}</CoreButton></NuxtLink>
      </div>
      <div class="grid grid-cols-2 gap-3 border-t border-sand-100 pt-4">
        <div><div class="text-[11.5px] text-muted">{{ $t('billing.mine.tripsUsed') }}</div><div class="money text-[15px] font-600">{{ activeTrips }} / {{ plan.maxTrips }}</div></div>
        <div><div class="text-[11.5px] text-muted">{{ $t('billing.mine.membersLimit') }}</div><div class="money text-[15px] font-600">{{ plan.maxMembers }}</div></div>
      </div>
      <button v-if="!sub.cancelledAt" class="self-start text-[13px] font-600 text-warn-fg hover:underline disabled:opacity-50" :disabled="cancelling" @click="cancel">{{ $t('billing.mine.cancelCta') }}</button>
    </div>
    <div v-else-if="sub.status === 'unlimited'" class="card p-[20px] text-[14px] text-ink-2">{{ $t('billing.unlimited') }}</div>
    <div v-else class="card p-[24px] flex flex-col items-start gap-3">
      <div class="text-[15px] font-700">{{ $t('billing.mine.noPlan') }}</div>
      <NuxtLink :to="localePath('/langganan')"><CoreButton variant="primary" class="!px-[16px] !py-[10px] !text-[13.5px]">{{ $t('billing.choose') }}</CoreButton></NuxtLink>
    </div>

    <!-- payment history -->
    <div class="flex flex-col gap-3">
      <div class="font-display text-[20px] font-600">{{ $t('billing.mine.history') }}</div>
      <div v-if="loading" class="card p-[18px] text-[13.5px] text-muted">{{ $t('billing.mine.loading') }}</div>
      <div v-else-if="!orders.length" class="card p-[18px] text-[13.5px] text-muted">{{ $t('billing.mine.noOrders') }}</div>
      <div v-else class="card p-[6px_18px]">
        <div v-for="o in orders" :key="o.id" class="py-[12px] border-b border-sand-100 last:border-0 flex items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="text-[14px] font-600">{{ PLANS[o.plan].name }} · {{ PERIOD_LABELS[o.period] }}</div>
            <div class="text-[12px] text-muted mt-[2px]">{{ fmtDate(o.paidAt || o.createdAt) }} · {{ methodLabel(o) }}</div>
            <div class="money text-[11px] text-muted mt-[2px] truncate">{{ o.id }}</div>
          </div>
          <div class="flex flex-col items-end gap-[4px] shrink-0">
            <span class="money text-[14px] font-600">{{ rp(o.amount) }}</span>
            <span class="rounded-pill px-[8px] py-[3px] text-[10.5px] font-700 leading-none" :class="o.status === 'paid' ? 'bg-teal-100 text-teal-700' : o.status === 'failed' ? 'bg-warn-bg text-warn-fg' : 'bg-sand-100 text-ink-2'">{{ $t('billing.mine.order.' + o.status) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
