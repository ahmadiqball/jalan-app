/** GET /api/member/guides — every published guide, for plans that include guides. */
export default defineEventHandler(async (event) => {
  await requireGuides(event)
  const region = (getQuery(event).region as string) || undefined
  return useRepositories(event).destinations.list({ region })
})
