import type { SupabaseClient } from '@supabase/supabase-js'
import type { TemplateTrip, TemplateRepository } from '../types'
import { defaultTemplates } from '../../utils/contentDefaults'

const TABLE = 'templates'
const tid = (t: TemplateTrip) => (t as { id: string }).id

type Row = { data: TemplateTrip; published: boolean }
/** the document as stored, with the column's draft/live flag mirrored onto it */
const withFlag = (data: unknown, published: boolean) => ({ ...(data as object), published }) as unknown as TemplateTrip

/** Supabase templates (Rute Kelana) store (service-role; admin-gated in routes).
 *  The `published` column is the source of truth for draft vs live; it is
 *  mirrored onto each document as `published` for the admin UI. Seeds the
 *  starters only when the table is truly empty (not when every row is a draft). */
export class SupabaseTemplateRepository implements TemplateRepository {
  constructor(private readonly sb: SupabaseClient) {}

  private async rows(): Promise<Row[]> {
    const { data, error } = await this.sb.from(TABLE).select('data, published').order('sort', { ascending: true })
    if (error) throw error
    if (data && data.length) return data as Row[]
    const seed = defaultTemplates()
    await this.sb.from(TABLE).upsert(seed.map((t, i) => ({ id: tid(t), data: t, sort: i, published: true })))
    return seed.map((t) => ({ data: t, published: true }))
  }

  async list(): Promise<TemplateTrip[]> {
    return (await this.rows()).filter((r) => r.published).map((r) => withFlag(r.data, true))
  }
  async listAll(): Promise<TemplateTrip[]> {
    return (await this.rows()).map((r) => withFlag(r.data, r.published))
  }
  async get(id: string): Promise<TemplateTrip | null> {
    const { data, error } = await this.sb.from(TABLE).select('data, published').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? withFlag(data.data, data.published) : null
  }
  async upsert(tpl: TemplateTrip): Promise<TemplateTrip> {
    const flag = (tpl as { published?: boolean }).published
    const row: Record<string, unknown> = { id: tid(tpl), data: tpl, updated_at: new Date().toISOString() }
    // only touch the column when the document says so (legacy docs keep their state)
    if (typeof flag === 'boolean') row.published = flag
    const { data, error } = await this.sb.from(TABLE).upsert(row).select('data, published').single()
    if (error) throw error
    return withFlag(data.data, data.published)
  }
  async remove(id: string): Promise<boolean> {
    const { error, count } = await this.sb.from(TABLE).delete({ count: 'exact' }).eq('id', id)
    if (error) throw error
    return (count ?? 0) > 0
  }
}
