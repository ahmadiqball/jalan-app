import type { Place } from '../../../repositories/types'

/** PUT /api/admin/places/:id — admin: upsert a place. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody<Partial<Place>>(event)
  if (!body.destinationId) throw createError({ statusCode: 400, statusMessage: 'destinationId wajib' })
  if (!(body.name || '').trim()) throw createError({ statusCode: 400, statusMessage: 'Nama tempat wajib' })
  return useRepositories(event).places.upsert({
    ...(body as Place),
    id,
    type: body.type || 'aktivitas',
  })
})
