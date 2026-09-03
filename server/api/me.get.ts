/** GET /api/me — who am I + admin flag (for the client to gate the admin UI). */
export default defineEventHandler(async (event) => {
  const actor = await getActor(event)
  if (!actor) return { authed: false, isAdmin: false, email: '' }
  return { authed: true, email: actor.email, isAdmin: isAdminActor(event, actor) }
})
