/** POST /api/trips/:id/share — enable public sharing, returns the share slug. */
export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const id = getRouterParam(event, 'id')!
  const repo = useRepositories(event).trips
  const existing = await repo.get(id)
  if (!existing || existing.ownerId !== actor.id) throw createError({ statusCode: 404, statusMessage: 'Trip tidak ditemukan' })
  const shareId = existing.shareId || shareSlug()
  const row = await repo.setShare(actor.id, id, shareId)
  return { shareId: row?.shareId ?? shareId }
})
