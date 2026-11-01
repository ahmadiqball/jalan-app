import type { H3Event } from 'h3'
import { addMonths, PERIOD_MONTHS } from '../../shared/utils/plans'
import type { BillingOrder, BillingRepository } from '../repositories/types'
import type { MidtransTransaction } from './midtrans'

/** Applies a transaction fetched from Midtrans to a pending order. */
export async function applyTransaction(repo: BillingRepository, order: BillingOrder, tx: MidtransTransaction, now = new Date()): Promise<BillingOrder['status']> {
  if (order.status !== 'pending' || tx.order_id !== order.id || Number(tx.gross_amount) !== order.amount) return order.status

  const paid = tx.transaction_status === 'settlement' || (tx.transaction_status === 'capture' && tx.fraud_status === 'accept')
  if (paid) {
    if (await repo.markPaid(order.id, tx.payment_type)) {
      try {
        const sub = await repo.getSubscription(order.userId)
        // same plan extends what's left; an upgrade starts now
        const base = sub?.plan === order.plan && new Date(sub.expiresAt) > now ? new Date(sub.expiresAt) : now
        await repo.saveSubscription(order.userId, { plan: order.plan, expiresAt: addMonths(base, PERIOD_MONTHS[order.period]).toISOString() })
      } catch (e) {
        // back to pending so the next webhook retry or status check can finish it
        await repo.reopenOrder(order.id)
        throw e
      }
    }
    return 'paid'
  }
  if (['deny', 'cancel', 'expire', 'failure'].includes(String(tx.transaction_status))) {
    await repo.markFailed(order.id)
    return 'failed'
  }
  return order.status
}

/** Brings a pending order up to date with Midtrans. */
export async function syncOrder(event: H3Event, order: BillingOrder): Promise<BillingOrder['status']> {
  if (order.status !== 'pending') return order.status
  return applyTransaction(useRepositories(event).billing, order, await getTransaction(event, order.id))
}
