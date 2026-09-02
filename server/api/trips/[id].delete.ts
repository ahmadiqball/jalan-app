/** DELETE /api/trips/:id */
export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const id = getRouterParam(event, 'id')!
  const ok = await useRepositories(event).trips.remove(actor.id, id)
  if (!ok) throw createError({ statusCode: 404, statusMessage: 'Trip tidak ditemukan' })
  return { ok: true }
})
