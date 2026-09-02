import type { TripData, TripRepository, TripRow } from '../types'

/** In-memory trip store — dev/test fallback, no credentials required. */
export class MemoryTripRepository implements TripRepository {
  private rows = new Map<string, TripRow>()

  async listByOwner(ownerId: string): Promise<TripRow[]> {
    return [...this.rows.values()]
      .filter((r) => r.ownerId === ownerId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async get(id: string): Promise<TripRow | null> {
    return this.rows.get(id) ?? null
  }

  async getByShare(shareId: string): Promise<TripRow | null> {
    for (const r of this.rows.values()) if (r.shareId === shareId) return r
    return null
  }

  async save(ownerId: string, trip: TripData): Promise<TripRow> {
    const existing = this.rows.get(trip.id)
    if (existing && existing.ownerId !== ownerId) {
      throw createError({ statusCode: 403, statusMessage: 'Bukan trip milikmu' })
    }
    const row: TripRow = {
      id: trip.id,
      ownerId,
      data: trip,
      shareId: existing?.shareId ?? null,
      version: (existing?.version ?? 0) + 1,
      updatedAt: new Date().toISOString(),
    }
    this.rows.set(trip.id, row)
    return row
  }

  async remove(ownerId: string, id: string): Promise<boolean> {
    const existing = this.rows.get(id)
    if (!existing || existing.ownerId !== ownerId) return false
    return this.rows.delete(id)
  }

  async setShare(ownerId: string, id: string, shareId: string | null): Promise<TripRow | null> {
    const existing = this.rows.get(id)
    if (!existing || existing.ownerId !== ownerId) return null
    existing.shareId = shareId
    existing.updatedAt = new Date().toISOString()
    return existing
  }
}
