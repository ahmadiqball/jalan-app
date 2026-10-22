import type { TemplateTrip, TemplateRepository } from '../types'
import { defaultTemplates } from '../../utils/contentDefaults'

const tid = (t: TemplateTrip) => (t as { id: string }).id

/** In-memory templates — seeded from defaults; edits last for the server's life. */
export class MemoryTemplateRepository implements TemplateRepository {
  private rows: TemplateTrip[] = defaultTemplates()
  async list(): Promise<TemplateTrip[]> {
    return this.rows
  }
  async get(id: string): Promise<TemplateTrip | null> {
    return this.rows.find((t) => tid(t) === id) ?? null
  }
  async upsert(tpl: TemplateTrip): Promise<TemplateTrip> {
    const i = this.rows.findIndex((t) => tid(t) === tid(tpl))
    if (i >= 0) this.rows[i] = tpl
    else this.rows.push(tpl)
    return tpl
  }
  async remove(id: string): Promise<boolean> {
    const n = this.rows.length
    this.rows = this.rows.filter((t) => tid(t) !== id)
    return this.rows.length < n
  }
}
