import type { Subscription } from '../../../shared/utils/plans'
import type { BillingOrder, BillingRepository } from '../types'

/** In-memory subscriptions and orders — last for the server's life. */
export class MemoryBillingRepository implements BillingRepository {
  private subs = new Map<string, Subscription>()
  private orders = new Map<string, BillingOrder>()

  async getSubscription(userId: string): Promise<Subscription | null> {
    return this.subs.get(userId) ?? null
  }
  async saveSubscription(userId: string, sub: Subscription): Promise<void> {
    this.subs.set(userId, sub)
  }
  async createOrder(order: Omit<BillingOrder, 'status'>): Promise<void> {
    this.orders.set(order.id, { ...order, status: 'pending' })
  }
  async getOrder(id: string): Promise<BillingOrder | null> {
    return this.orders.get(id) ?? null
  }
  async markPaid(id: string): Promise<boolean> {
    const o = this.orders.get(id)
    if (!o || o.status !== 'pending') return false
    o.status = 'paid'
    return true
  }
  async markFailed(id: string): Promise<void> {
    const o = this.orders.get(id)
    if (o?.status === 'pending') o.status = 'failed'
  }
}
