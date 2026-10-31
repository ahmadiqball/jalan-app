import { defaultDestinations, defaultPlaces } from '../../../utils/guidesDefaults'

/** POST /api/admin/guides/seed — upsert the curated example catalog
 *  (Bali + Banda Neira) into the active repo. Admin only; idempotent. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const repo = useRepositories(event)
  const dests = defaultDestinations()
  const places = defaultPlaces()
  for (const d of dests) await repo.destinations.upsert(d)
  for (const p of places) await repo.places.upsert(p)
  await bustContentCache()
  return { ok: true, destinations: dests.length, places: places.length }
})
