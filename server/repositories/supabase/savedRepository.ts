import type { SupabaseClient } from '@supabase/supabase-js'
import type { SavedItem, SavedRepository } from '../types'

const TABLE = 'saved_items'

/** Supabase bookmarks store (service-role; actor-scoped in routes). */
export class SupabaseSavedRepository implements SavedRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async list(userId: string): Promise<SavedItem[]> {
    const { data, error } = await this.sb.from(TABLE).select('kind,ref_id').eq('user_id', userId)
    if (error) throw error
    return (data ?? []).map((r) => ({ kind: r.kind as string, refId: r.ref_id as string }))
  }
  async add(userId: string, kind: string, refId: string): Promise<void> {
    const { error } = await this.sb.from(TABLE).upsert({ user_id: userId, kind, ref_id: refId })
    if (error) throw error
  }
  async remove(userId: string, kind: string, refId: string): Promise<void> {
    const { error } = await this.sb.from(TABLE).delete().eq('user_id', userId).eq('kind', kind).eq('ref_id', refId)
    if (error) throw error
  }
}
