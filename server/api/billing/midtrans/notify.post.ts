import { addMonths, PERIOD_MONTHS } from '../../../../shared/utils/plans'
import type { MidtransNotification } from '../../../utils/midtrans'

/** POST /api/billing/midtrans/notify — Midtrans payment webhook. Public, so signature-gated. */
export default defineEventHandler(async (event) => {
  const n = await readBody<MidtransNotification>(event)
  if (!verifyNotification(event, n)) throw createError({ statusCode: 403, statusMessage: 'Tanda tangan tidak valid' })

  const repo = useRepositories(event).billing
  const order = await repo.getOrder(String(n.order_id))
  // unknown order: acknowledge so Midtrans stops retrying (e.g. its dashboard test ping)
  if (!order) return { ok: true }
  if (Number(n.gross_amount) !== order.amount) throw createError({ statusCode: 400, statusMessage: 'Jumlah tidak cocok' })

  const paid = n.status_code === '200'
    && (n.transaction_status === 'settlement' || (n.transaction_status === 'capture' && n.fraud_status === 'accept'))
  if (paid) {
    if (await repo.markPaid(order.id)) {
      const sub = await repo.getSubscription(order.userId)
      const now = new Date()
      // same plan extends what's left; an upgrade starts now
      const base = sub?.plan === order.plan && new Date(sub.expiresAt) > now ? new Date(sub.expiresAt) : now
      await repo.saveSubscription(order.userId, { plan: order.plan, expiresAt: addMonths(base, PERIOD_MONTHS[order.period]).toISOString() })
    }
  } else if (['deny', 'cancel', 'expire', 'failure'].includes(String(n.transaction_status))) {
    await repo.markFailed(order.id)
  }
  return { ok: true }
})
