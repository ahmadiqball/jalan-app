/** DELETE /api/admin/places/:id — admin: remove a place. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  await useRepositories(event).places.remove(id)
  return { ok: true }
})
