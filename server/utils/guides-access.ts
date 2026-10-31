import type { H3Event } from 'h3'

/** Guard for the uncached guide routes: full library needs a plan that includes guides. */
export async function requireGuides(event: H3Event) {
  const actor = await requireActor(event)
  const ent = await entitlementFor(event, actor.id, actor)
  if (!ent.guides) throw planError('Panduan ini butuh Kelana Plus atau Premium')
}
