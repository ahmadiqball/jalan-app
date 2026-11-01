import { PLAN_LIST, PLANS } from '#shared/utils/plans'

/** Explains why a trip can't take another member, and offers a plan that fits more. */
export function useMemberLimit() {
  const { sub } = useSubscription()
  const { confirm } = useConfirm()
  const { t } = useI18n()
  const localePath = useLocalePath()

  async function promptMemberLimit() {
    const { plan, maxMembers } = sub.value
    const next = PLAN_LIST.find((p) => p.maxMembers > (maxMembers ?? 0))
    const current = plan ? t('billing.memberLimit.current', { plan: PLANS[plan].name, n: maxMembers ?? 0 }) : ''

    if (!next) {
      await confirm({ title: t('billing.memberLimit.title'), message: `${current} ${t('billing.memberLimit.top')}`, confirmLabel: t('billing.memberLimit.ok'), hideCancel: true })
      return
    }
    const ok = await confirm({
      title: t(plan ? 'billing.memberLimit.title' : 'billing.memberLimit.noPlanTitle'),
      message: plan ? `${current} ${t('billing.memberLimit.upgrade', { next: next.name, max: next.maxMembers })}` : t('billing.memberLimit.noPlan'),
      confirmLabel: t(plan ? 'billing.memberLimit.cta' : 'billing.choose'),
    })
    if (ok) await navigateTo(localePath('/langganan'))
  }
  return { promptMemberLimit }
}
