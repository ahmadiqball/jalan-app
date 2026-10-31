import { entitlementOf, isBillingPeriod, isPlanId, PERIOD_LABELS, PLANS } from '../../../shared/utils/plans'

/** POST /api/billing/checkout — start a Midtrans payment for a plan. Amounts come from the server. */
export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const { plan, period } = await readBody<{ plan?: unknown; period?: unknown }>(event)
  if (!isPlanId(plan) || !isBillingPeriod(period)) throw createError({ statusCode: 400, statusMessage: 'Paket tidak valid' })

  const repo = useRepositories(event).billing
  const current = entitlementOf(await repo.getSubscription(actor.id))
  if (current.plan && PLANS[current.plan].rank > PLANS[plan].rank) {
    throw createError({ statusCode: 409, statusMessage: 'Paketmu masih aktif', message: 'Paket lebih rendah bisa dibeli setelah paket sekarang berakhir' })
  }

  const p = PLANS[plan]
  const orderId = `KLN-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`
  const amount = p.prices[period]
  await repo.createOrder({ id: orderId, userId: actor.id, plan, period, amount })
  const finishUrl = `${getRequestURL(event).origin}/langganan`
  const redirectUrl = await createSnapPayment(event, { orderId, amount, itemName: `${p.name} ${PERIOD_LABELS[period]}`, finishUrl })
  return { redirectUrl, orderId }
})
