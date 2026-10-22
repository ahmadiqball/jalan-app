/** GET /api/saved — the signed-in user's bookmarks, resolved for display. */
export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const repo = useRepositories(event)
  const items = await repo.saved.list(actor.id)
  const guideIds = items.filter((i) => i.kind === 'guide').map((i) => i.refId)
  const placeIds = items.filter((i) => i.kind === 'place').map((i) => i.refId)

  const guides = (await Promise.all(guideIds.map((id) => repo.destinations.getById(id)))).filter(Boolean)
  const placeRows = (await Promise.all(placeIds.map((id) => repo.places.getById(id)))).filter(Boolean)
  // attach the parent destination slug so saved places can link back
  const places = await Promise.all(
    placeRows.map(async (p) => {
      const d = p ? await repo.destinations.getById(p.destinationId) : null
      return { ...p, destinationSlug: d?.slug || '' }
    }),
  )

  return { guideIds, placeIds, guides, places }
})
