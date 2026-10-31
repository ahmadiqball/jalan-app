/** GET /api/member/guides/:slug — any published guide, for plans that include guides. */
export default defineEventHandler(async (event) => {
  await requireGuides(event)
  const repo = useRepositories(event)
  const destination = await repo.destinations.getBySlug(getRouterParam(event, 'slug')!)
  if (!destination || !destination.published) throw createError({ statusCode: 404, statusMessage: 'Panduan tidak ditemukan' })
  const places = await repo.places.listByDestination(destination.id)
  return { ...destination, places }
})
