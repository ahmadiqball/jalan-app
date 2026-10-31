import type { SupabaseClient } from '@supabase/supabase-js'
import type { Subscription } from '../../../shared/utils/plans'
import type { BillingOrder, BillingRepository } from '../types'

function mapOrder(r: Record<string, unknown>): BillingOrder {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    plan: r.plan as BillingOrder['plan'],
    period: r.period as BillingOrder['period'],
    amount: r.amount as number,
    status: r.status as BillingOrder['status'],
    paymentType: (r.payment_type as string) ?? null,
    createdAt: r.created_at as string,
    paidAt: (r.paid_at as string) ?? null,
  }
}

/** Supabase subscription + order store (service-role; gated in routes). */
export class SupabaseBillingRepository implements BillingRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async getSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await this.sb.from('subscriptions').select('plan, expires_at, cancelled_at').eq('user_id', userId).maybeSingle()
    if (error) throw error
    return data ? { plan: data.plan, expiresAt: data.expires_at, cancelledAt: data.cancelled_at } : null
  }
  async saveSubscription(userId: string, sub: Subscription): Promise<void> {
    const { error } = await this.sb.from('subscriptions').upsert({ user_id: userId, plan: sub.plan, expires_at: sub.expiresAt, cancelled_at: null, updated_at: new Date().toISOString() })
    if (error) throw error
  }
  async cancelSubscription(userId: string): Promise<void> {
    const now = new Date().toISOString()
    const { error } = await this.sb.from('subscriptions').update({ cancelled_at: now, updated_at: now }).eq('user_id', userId)
    if (error) throw error
  }
  async createOrder(order: Omit<BillingOrder, 'status'>): Promise<void> {
    const { error } = await this.sb.from('billing_orders').insert({ id: order.id, user_id: order.userId, plan: order.plan, period: order.period, amount: order.amount })
    if (error) throw error
  }
  async getOrder(id: string): Promise<BillingOrder | null> {
    const { data, error } = await this.sb.from('billing_orders').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? mapOrder(data) : null
  }
  async listOrders(userId: string): Promise<BillingOrder[]> {
    const { data, error } = await this.sb.from('billing_orders').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapOrder)
  }
  async markPaid(id: string, paymentType?: string): Promise<boolean> {
    // only the pending -> paid transition wins, so a repeated webhook can't extend twice
    const { data, error } = await this.sb.from('billing_orders')
      .update({ status: 'paid', paid_at: new Date().toISOString(), payment_type: paymentType ?? null })
      .eq('id', id).eq('status', 'pending').select('id')
    if (error) throw error
    return (data?.length ?? 0) > 0
  }
  async markFailed(id: string): Promise<void> {
    const { error } = await this.sb.from('billing_orders').update({ status: 'failed' }).eq('id', id).eq('status', 'pending')
    if (error) throw error
  }
}
