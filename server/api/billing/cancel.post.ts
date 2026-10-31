import { entitlementOf } from '../../../shared/utils/plans'

/** POST /api/billing/cancel — mark the plan cancelled. Access runs until it expires, with no refund. */
export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const repo = useRepositories(event).billing
  const sub = await repo.getSubscription(actor.id)
  if (entitlementOf(sub).status !== 'active') throw createError({ statusCode: 409, statusMessage: 'Tidak ada paket aktif' })
  await repo.cancelSubscription(actor.id)
  return { ok: true }
})
