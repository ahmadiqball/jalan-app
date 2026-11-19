/** GET /api/admin/templates — admin: every Rute Kelana route, drafts included. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return useRepositories(event).templates.listAll()
})
