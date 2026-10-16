import type { Destination, DestinationRepository } from '../types'
import { defaultDestinations } from '../../utils/guidesDefaults'

/** In-memory destinations — seeded from defaults; edits last for the server's life. */
export class MemoryDestinationRepository implements DestinationRepository {
  private rows: Destination[] = defaultDestinations()

  async list(opts?: { region?: string; includeUnpublished?: boolean }): Promise<Destination[]> {
    return this.rows
      .filter((d) => (opts?.includeUnpublished ? true : d.published))
      .filter((d) => (opts?.region ? d.region === opts.region : true))
      .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.name.localeCompare(b.name))
  }
  async getBySlug(slug: string): Promise<Destination | null> {
    return this.rows.find((d) => d.slug === slug) ?? null
  }
  async getById(id: string): Promise<Destination | null> {
    return this.rows.find((d) => d.id === id) ?? null
  }
  async upsert(dest: Destination): Promise<Destination> {
    const i = this.rows.findIndex((d) => d.id === dest.id)
    if (i >= 0) this.rows[i] = dest
    else this.rows.push(dest)
    return dest
  }
  async remove(id: string): Promise<boolean> {
    const n = this.rows.length
    this.rows = this.rows.filter((d) => d.id !== id)
    return this.rows.length < n
  }
}
