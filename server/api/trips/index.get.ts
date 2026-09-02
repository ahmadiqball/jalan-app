/** GET /api/trips — list the current user's trips (data documents). */
export default defineEventHandler(async (event) => {
  const ownerId = await requireUserId(event)
  const rows = await useRepositories(event).trips.listByOwner(ownerId)
  return rows.map((r) => ({ ...r.data, _v: r.version, _shareId: r.shareId }))
})
