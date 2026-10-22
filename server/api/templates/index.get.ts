/** GET /api/templates — public list of starter templates. */
export default defineEventHandler(async (event) => {
  return useRepositories(event).templates.list()
})
