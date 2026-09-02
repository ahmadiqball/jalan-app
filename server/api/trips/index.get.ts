/** GET /api/trips — trips the current user owns or is a member of. */
export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const rows = await useRepositories(event).trips.listForUser(actor.id, actor.email)
  return rows.map((r) => ({ ...r.data, _v: r.version, _shareId: r.shareId, _role: roleFor(r, actor) }))
})
