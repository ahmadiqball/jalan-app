/** GET /api/member/places/:id — any published place, for plans that include guides. */
export default defineEventHandler(async (event) => {
  await requireGuides(event)
  const repo = useRepositories(event)
  const place = await repo.places.getById(getRouterParam(event, 'id')!)
  const destination = place && await repo.destinations.getById(place.destinationId)
  if (!place || !destination || !destination.published) throw createError({ statusCode: 404, statusMessage: 'Tempat tidak ditemukan' })
  return { ...place, destination: { slug: destination.slug, name: destination.name } }
})
