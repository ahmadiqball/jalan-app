import { syncOrder } from '../../../utils/billing'

/**
 * POST /api/billing/midtrans/notify — Midtrans payment webhook. Public, so nothing
 * in the body is trusted: it only says which order to re-check with Midtrans.
 */
export default defineEventHandler(async (event) => {
  const { order_id: id } = await readBody<{ order_id?: unknown }>(event)
  const order = id ? await useRepositories(event).billing.getOrder(String(id)) : null
  // unknown order: acknowledge so Midtrans stops retrying (e.g. its dashboard test ping)
  if (order) await syncOrder(event, order)
  return { ok: true }
})
