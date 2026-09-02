/** DELETE /api/trips/:id/share — disable public sharing. */
export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const id = getRouterParam(event, 'id')!
  await useRepositories(event).trips.setShare(actor.id, id, null)
  return { ok: true }
})
