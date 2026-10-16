import type { Destination } from '../../../repositories/types'

/** PUT /api/admin/destinations/:id — admin: upsert a destination. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody<Partial<Destination>>(event)
  const name = (body.name || '').trim()
  const slug = (body.slug || '').trim() || id
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Nama wajib diisi' })
  return useRepositories(event).destinations.upsert({
    ...(body as Destination),
    id,
    name,
    slug,
    region: body.region || '',
  })
})
