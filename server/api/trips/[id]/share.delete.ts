/** DELETE /api/trips/:id/share — disable public sharing. */
export default defineEventHandler(async (event) => {
  const ownerId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  await useRepositories(event).trips.setShare(ownerId, id, null)
  return { ok: true }
})
