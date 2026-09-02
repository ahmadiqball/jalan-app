/** POST /api/trips/:id/share — enable public sharing, returns the share slug. */
export default defineEventHandler(async (event) => {
  const ownerId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const repo = useRepositories(event).trips
  const existing = await repo.get(id)
  if (!existing || existing.ownerId !== ownerId) throw createError({ statusCode: 404, statusMessage: 'Trip tidak ditemukan' })
  const shareId = existing.shareId || shareSlug()
  const row = await repo.setShare(ownerId, id, shareId)
  return { shareId: row?.shareId ?? shareId }
})
