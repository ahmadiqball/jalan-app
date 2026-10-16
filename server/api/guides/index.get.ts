/** GET /api/guides — public list of published destinations (optional ?region=). */
export default defineEventHandler(async (event) => {
  const region = (getQuery(event).region as string) || undefined
  return useRepositories(event).destinations.list({ region })
})
