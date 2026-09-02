/** GET /api/trips/:id — allowed for owner or any member. */
export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const id = getRouterParam(event, 'id')!
  const row = await useRepositories(event).trips.get(id)
  const role = row && roleFor(row, actor)
  if (!row || !canRead(role)) throw createError({ statusCode: 404, statusMessage: 'Trip tidak ditemukan' })
  return { ...row.data, _v: row.version, _shareId: row.shareId, _role: role }
})
