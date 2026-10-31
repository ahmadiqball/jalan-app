/** GET /api/billing/orders — the signed-in user's payment history, newest first. */
export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const orders = await useRepositories(event).billing.listOrders(actor.id)
  return orders.map(({ userId, ...o }) => o)
})
