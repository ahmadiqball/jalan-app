/** DELETE /api/admin/destinations/:id — admin: remove a destination (+ its
 *  places via ON DELETE CASCADE in Supabase; memory removes the row only). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  await useRepositories(event).destinations.remove(id)
  await bustContentCache()
  return { ok: true }
})
