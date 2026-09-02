import type { TripData } from '../../repositories/types'

/** PUT /api/trips/:id — upsert the whole trip document. */
export default defineEventHandler(async (event) => {
  const ownerId = await requireUserId(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody<TripData>(event)
  if (!body || typeof body !== 'object' || body.id !== id) {
    throw createError({ statusCode: 400, statusMessage: 'Trip tidak valid' })
  }
  // strip transient sync fields before persisting
  const { _v, _shareId, ...trip } = body as TripData & { _v?: number; _shareId?: string }
  const row = await useRepositories(event).trips.save(ownerId, trip as TripData)
  return { ...row.data, _v: row.version, _shareId: row.shareId }
})
