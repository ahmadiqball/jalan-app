/** DELETE /api/trips/:id */
export default defineEventHandler(async (event) => {
  const ownerId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const ok = await useRepositories(event).trips.remove(ownerId, id)
  if (!ok) throw createError({ statusCode: 404, statusMessage: 'Trip tidak ditemukan' })
  return { ok: true }
})
