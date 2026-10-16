/** GET /api/guides/:slug — public: one published destination + its places. */
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const repo = useRepositories(event)
  const destination = await repo.destinations.getBySlug(slug)
  if (!destination || !destination.published) {
    throw createError({ statusCode: 404, statusMessage: 'Panduan tidak ditemukan' })
  }
  const places = await repo.places.listByDestination(destination.id)
  return { ...destination, places }
})
