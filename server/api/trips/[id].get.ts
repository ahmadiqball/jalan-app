/** GET /api/trips/:id — one trip the current user owns. */
export default defineEventHandler(async (event) => {
  const ownerId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const row = await useRepositories(event).trips.get(id)
  if (!row || row.ownerId !== ownerId) throw createError({ statusCode: 404, statusMessage: 'Trip tidak ditemukan' })
  return { ...row.data, _v: row.version, _shareId: row.shareId }
})
