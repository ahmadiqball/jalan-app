import type { ContentDoc } from '../repositories/types'

/** PUT /api/content — replace app content (admin only). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<ContentDoc>(event)
  if (!body || !Array.isArray(body.templates) || !Array.isArray(body.recs)) {
    throw createError({ statusCode: 400, statusMessage: 'Konten tidak valid' })
  }
  return useRepositories(event).content.save({ templates: body.templates, recs: body.recs })
})
