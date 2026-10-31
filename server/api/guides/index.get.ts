/** GET /api/guides — public guides only (optional ?region=). Cached, so never plan-dependent. */
export default defineEventHandler(async (event) => {
  const region = (getQuery(event).region as string) || undefined
  const rows = await useRepositories(event).destinations.list({ region })
  return rows.filter((d) => d.isPublic)
})
