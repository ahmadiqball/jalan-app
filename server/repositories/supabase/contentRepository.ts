import type { SupabaseClient } from '@supabase/supabase-js'
import type { ContentDoc, ContentRepository } from '../types'
import { defaultContent } from '../../utils/contentDefaults'

const TABLE = 'app_content'
const ID = 'global'

/** Single-row content store (app_content/global). Falls back to defaults if empty. */
export class SupabaseContentRepository implements ContentRepository {
  constructor(private readonly sb: SupabaseClient) {}

  async get(): Promise<ContentDoc> {
    const { data, error } = await this.sb.from(TABLE).select('data').eq('id', ID).maybeSingle()
    if (error) throw error
    return (data?.data as ContentDoc) ?? defaultContent()
  }

  async save(doc: ContentDoc): Promise<ContentDoc> {
    const { data, error } = await this.sb
      .from(TABLE)
      .upsert({ id: ID, data: doc, updated_at: new Date().toISOString() })
      .select('data')
      .single()
    if (error) throw error
    return data.data as ContentDoc
  }
}
