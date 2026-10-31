/** GET /api/billing/orders/:id — the buyer's own order status, for the return page. */
export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const order = await useRepositories(event).billing.getOrder(getRouterParam(event, 'id')!)
  if (!order || order.userId !== actor.id) throw createError({ statusCode: 404, statusMessage: 'Pesanan tidak ditemukan' })
  return { status: order.status }
})
