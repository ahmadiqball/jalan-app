/** GET /api/admin/destinations/:id — admin: one destination + its places. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const repo = useRepositories(event)
  const destination = await repo.destinations.getById(id)
  if (!destination) throw createError({ statusCode: 404, statusMessage: 'Panduan tidak ditemukan' })
  const places = await repo.places.listByDestination(id)
  return { ...destination, places }
})
