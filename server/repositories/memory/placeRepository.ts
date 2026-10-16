import type { Place, PlaceRepository } from '../types'
import { defaultPlaces } from '../../utils/guidesDefaults'

/** In-memory places — seeded from defaults; edits last for the server's life. */
export class MemoryPlaceRepository implements PlaceRepository {
  private rows: Place[] = defaultPlaces()

  async listByDestination(destinationId: string): Promise<Place[]> {
    return this.rows
      .filter((p) => p.destinationId === destinationId)
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.name.localeCompare(b.name))
  }
  async getById(id: string): Promise<Place | null> {
    return this.rows.find((p) => p.id === id) ?? null
  }
  async upsert(place: Place): Promise<Place> {
    const i = this.rows.findIndex((p) => p.id === place.id)
    if (i >= 0) this.rows[i] = place
    else this.rows.push(place)
    return place
  }
  async remove(id: string): Promise<boolean> {
    const n = this.rows.length
    this.rows = this.rows.filter((p) => p.id !== id)
    return this.rows.length < n
  }
}
