import { isTripActive, tripWriteViolation } from '../../../shared/utils/plans'
import type { TripData } from '../../repositories/types'

/** PUT /api/trips/:id — create (new) or replace (owner/editor only). */
export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody<TripData>(event)
  if (!body || typeof body !== 'object' || body.id !== id) {
    throw createError({ statusCode: 400, statusMessage: 'Trip tidak valid' })
  }
  // strip transient sync fields before persisting
  const { _v, _shareId, _role, ...trip } = body as TripData & { _v?: number; _shareId?: string; _role?: string }
  const repo = useRepositories(event).trips

  const existing = await repo.get(id)
  let row
  if (!existing) {
    const { ent, rows } = await ownerUsage(event, actor.id, actor)
    const violation = tripWriteViolation(ent, null, trip, { activeOwned: rows.filter((r) => isTripActive(r.data)).length, locked: false })
    if (violation) throw planError(violation)
    row = await repo.create(actor.id, trip as TripData)
  } else {
    const role = roleFor(existing, actor)
    if (!canWrite(role)) {
      throw createError({ statusCode: 403, statusMessage: 'Kamu hanya bisa melihat trip ini' })
    }
    // removing a member or changing a role is owner-only
    if (role !== 'owner') {
      const prev = (existing.data.members as { id?: string; email?: string; role?: string }[]) || []
      const next = (trip.members as { id?: string; email?: string; role?: string }[]) || []
      if (revokesOrRerolesMembers(prev, next)) {
        throw createError({ statusCode: 403, statusMessage: 'Hanya pemilik yang bisa mengeluarkan anggota atau mengubah peran' })
      }
    }
    const { ent, rows, locked } = await ownerUsage(event, existing.ownerId, actor)
    const violation = tripWriteViolation(ent, existing.data, trip, {
      activeOwned: rows.filter((r) => isTripActive(r.data)).length,
      locked: locked.includes(id),
    })
    if (violation) throw planError(violation)
    row = await repo.replace(id, trip as TripData)
  }
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Trip tidak ditemukan' })
  return { ...row.data, _v: row.version, _shareId: row.shareId, _role: roleFor(row, actor) }
})
