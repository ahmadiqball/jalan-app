/** GET /api/saved — the signed-in user's bookmarks, resolved for display. */
export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const repo = useRepositories(event)
  const items = await repo.saved.list(actor.id)
  const guideIds = items.filter((i) => i.kind === 'guide').map((i) => i.refId)
  const placeIds = items.filter((i) => i.kind === 'place').map((i) => i.refId)

  const { guides: paid } = await entitlementFor(event, actor.id, actor)
  const allGuides = (await Promise.all(guideIds.map((id) => repo.destinations.getById(id)))).filter(Boolean)
  // bookmarks of paid guides stay stored but only resolve while the plan includes them
  const guides = allGuides.filter((d) => paid || d!.isPublic)
  const placeRows = (await Promise.all(placeIds.map((id) => repo.places.getById(id)))).filter(Boolean)
  // attach the parent destination slug so saved places can link back
  const resolved = await Promise.all(
    placeRows.map(async (p) => {
      const d = p ? await repo.destinations.getById(p.destinationId) : null
      return paid || d?.isPublic ? { ...p, destinationSlug: d?.slug || '' } : null
    }),
  )
  const places = resolved.filter(Boolean)

  return { guideIds, placeIds, guides, places }
})
