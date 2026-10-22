import type { SupabaseClient } from '@supabase/supabase-js'
import type { TemplateTrip, TemplateRepository } from '../types'
import { defaultTemplates } from '../../utils/contentDefaults'

const TABLE = 'templates'
const tid = (t: TemplateTrip) => (t as { id: string }).id

/** Supabase templates store (service-role; admin-gated in routes). Seeds the
 *  table from defaults on first read so a fresh project still ships starters. */
export class SupabaseTemplateRepository implements TemplateRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async list(): Promise<TemplateTrip[]> {
    const { data, error } = await this.sb.from(TABLE).select('data').eq('published', true).order('sort', { ascending: true })
    if (error) throw error
    if (!data || data.length === 0) {
      const seed = defaultTemplates()
      await this.sb.from(TABLE).upsert(seed.map((t, i) => ({ id: tid(t), data: t, sort: i, published: true })))
      return seed
    }
    return data.map((r) => r.data as TemplateTrip)
  }
  async get(id: string): Promise<TemplateTrip | null> {
    const { data, error } = await this.sb.from(TABLE).select('data').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? (data.data as TemplateTrip) : null
  }
  async upsert(tpl: TemplateTrip): Promise<TemplateTrip> {
    const { data, error } = await this.sb
      .from(TABLE)
      .upsert({ id: tid(tpl), data: tpl, updated_at: new Date().toISOString() })
      .select('data')
      .single()
    if (error) throw error
    return data.data as TemplateTrip
  }
  async remove(id: string): Promise<boolean> {
    const { error, count } = await this.sb.from(TABLE).delete({ count: 'exact' }).eq('id', id)
    if (error) throw error
    return (count ?? 0) > 0
  }
}
