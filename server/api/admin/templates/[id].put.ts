import type { TemplateTrip } from '../../../repositories/types'

/** PUT /api/admin/templates/:id — admin: upsert a starter template. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody<TemplateTrip>(event)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Template tidak valid' })
  // force the row id onto the document so they can't diverge
  const saved = await useRepositories(event).templates.upsert({ ...(body as object), id } as TemplateTrip)
  await bustContentCache()
  return saved
})
