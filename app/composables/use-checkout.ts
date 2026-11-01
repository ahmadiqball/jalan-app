import { PERIOD_LABELS, PLANS, purchaseExpiry, switchCredit, type BillingPeriod, type PlanId } from '#shared/utils/plans'

/** Start paying for a plan. Signed-out buyers log in first and resume on /langganan. */
export function useCheckout() {
  const session = useSessionStore()
  const localePath = useLocalePath()
  const { apiFetch } = useApi()
  const { flash } = useToast()
  const { t } = useI18n()
  const { confirm } = useConfirm()
  const { sub, loaded, refresh } = useSubscription()
  const busy = ref('')

  /** Moving to a higher plan converts the time left, so say what they get before paying. */
  async function confirmSwitch(plan: PlanId, period: BillingPeriod) {
    if (!loaded.value) await refresh()
    const { plan: from, expiresAt } = sub.value
    if (!from || !expiresAt || PLANS[plan].rank <= PLANS[from].rank) return true
    const current = { plan: from, expiresAt }
    const { daysLeft, extraDays } = switchCredit(current, plan)
    return confirm({
      title: t('billing.switch.title', { plan: PLANS[plan].name }),
      message: t('billing.switch.message', {
        days: daysLeft,
        from: PLANS[from].name,
        extra: extraDays,
        plan: PLANS[plan].name,
        period: PERIOD_LABELS[period],
        date: purchaseExpiry(current, plan, period).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      }),
      confirmLabel: t('billing.switch.confirm'),
    })
  }

  async function start(plan: PlanId, period: BillingPeriod) {
    if (!session.authed) {
      const next = `/langganan?plan=${plan}&period=${period}`
      return navigateTo(localePath(`/masuk?next=${encodeURIComponent(next)}`))
    }
    busy.value = plan
    try {
      if (!await confirmSwitch(plan, period)) {
        busy.value = ''
        return
      }
      const { redirectUrl } = await apiFetch<{ redirectUrl: string }>('/api/billing/checkout', { method: 'POST', body: { plan, period } })
      window.location.href = redirectUrl
    } catch (e) {
      busy.value = ''
      flash((e as { data?: { message?: string } }).data?.message || t('billing.failed'))
    }
  }
  return { busy, start }
}
