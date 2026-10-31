import { NO_PLAN } from '../../shared/utils/plans'

/** GET /api/me — who am I, admin flag, and my plan (for the client to gate its UI). */
export default defineEventHandler(async (event) => {
  const actor = await getActor(event)
  if (!actor) return { authed: false, isAdmin: false, email: '', subscription: NO_PLAN, lockedTripIds: [] }
  return {
    authed: true,
    email: actor.email,
    isAdmin: isAdminActor(event, actor),
    subscription: await entitlementFor(event, actor.id, actor),
    lockedTripIds: await visibleLockedIds(event, actor),
  }
})
