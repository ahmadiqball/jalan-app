import type { SavedItem, SavedRepository } from '../types'

/** In-memory bookmarks, keyed by user; lasts for the server's lifetime. */
export class MemorySavedRepository implements SavedRepository {
  private byUser = new Map<string, SavedItem[]>()
  async list(userId: string): Promise<SavedItem[]> {
    return this.byUser.get(userId) ?? []
  }
  async add(userId: string, kind: string, refId: string): Promise<void> {
    const a = this.byUser.get(userId) ?? []
    if (!a.some((x) => x.kind === kind && x.refId === refId)) a.push({ kind, refId })
    this.byUser.set(userId, a)
  }
  async remove(userId: string, kind: string, refId: string): Promise<void> {
    this.byUser.set(userId, (this.byUser.get(userId) ?? []).filter((x) => !(x.kind === kind && x.refId === refId)))
  }
}
