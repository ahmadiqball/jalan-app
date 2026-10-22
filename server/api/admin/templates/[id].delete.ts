/** DELETE /api/admin/templates/:id — admin: remove a starter template. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  await useRepositories(event).templates.remove(id)
  return { ok: true }
})
