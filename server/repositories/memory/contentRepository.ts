import type { ContentDoc, ContentRepository } from '../types'
import { defaultContent } from '../../utils/contentDefaults'

/** In-memory content — seeded from defaults; edits last for the server's lifetime. */
export class MemoryContentRepository implements ContentRepository {
  private doc: ContentDoc = defaultContent()
  async get(): Promise<ContentDoc> {
    return this.doc
  }
  async save(doc: ContentDoc): Promise<ContentDoc> {
    this.doc = doc
    return this.doc
  }
}
