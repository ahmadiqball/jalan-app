/** GET /api/share/:id — public, read-only trip by share slug (no auth). */
export default defineEventHandler(async (event) => {
  const shareId = getRouterParam(event, 'id')!
  const row = await useRepositories(event).trips.getByShare(shareId)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Trip tidak ditemukan' })
  return row.data
})
