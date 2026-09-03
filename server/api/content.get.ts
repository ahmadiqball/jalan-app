/** GET /api/content — starter templates + packing recommendations (public). */
export default defineEventHandler(async (event) => {
  return useRepositories(event).content.get()
})
