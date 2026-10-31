/** GET /api/places/:id — a place in a public guide, plus minimal parent context
 *  (slug + name) for the detail page's "back to guide" link. */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const repo = useRepositories(event)
  const place = await repo.places.getById(id)
  if (!place) throw createError({ statusCode: 404, statusMessage: 'Tempat tidak ditemukan' })

  const destination = await repo.destinations.getById(place.destinationId)
  if (!destination || !destination.published || !destination.isPublic) {
    throw createError({ statusCode: 404, statusMessage: 'Tempat tidak ditemukan' })
  }
  return { ...place, destination: { slug: destination.slug, name: destination.name } }
})
