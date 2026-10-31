/**
 * Invalidate cached public content after an admin write. The public read
 * endpoints are cached via routeRules (swr), so without this an edit would only
 * show up after the TTL. Admin writes are infrequent, so clearing the cache
 * mount is fine — it re-populates on the next read.
 */
export async function bustContentCache(): Promise<void> {
  try {
    const storage = useStorage('cache')
    const keys = await storage.getKeys()
    await Promise.all(keys.map((k) => storage.removeItem(k)))
  } catch {
    /* best-effort; a stale cache self-heals within the TTL */
  }
}
