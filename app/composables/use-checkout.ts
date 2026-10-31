import type { BillingPeriod, PlanId } from '#shared/utils/plans'

/** Start paying for a plan. Signed-out buyers log in first and resume on /langganan. */
export function useCheckout() {
  const session = useSessionStore()
  const localePath = useLocalePath()
  const { apiFetch } = useApi()
  const { flash } = useToast()
  const { t } = useI18n()
  const busy = ref('')

  async function start(plan: PlanId, period: BillingPeriod) {
    if (!session.authed) {
      const next = `/langganan?plan=${plan}&period=${period}`
      return navigateTo(localePath(`/masuk?next=${encodeURIComponent(next)}`))
    }
    busy.value = plan
    try {
      const { redirectUrl } = await apiFetch<{ redirectUrl: string }>('/api/billing/checkout', { method: 'POST', body: { plan, period } })
      window.location.href = redirectUrl
    } catch (e) {
      busy.value = ''
      flash((e as { data?: { message?: string } }).data?.message || t('billing.failed'))
    }
  }
  return { busy, start }
}
