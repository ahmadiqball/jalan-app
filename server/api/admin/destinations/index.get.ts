/** GET /api/admin/destinations — admin: all destinations (incl. unpublished). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return useRepositories(event).destinations.list({ includeUnpublished: true })
})
