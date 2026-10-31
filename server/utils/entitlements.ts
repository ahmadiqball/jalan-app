import type { H3Event } from 'h3'
import { entitlementOf, lockedTripIds, NO_PLAN, UNLIMITED, type Entitlement } from '../../shared/utils/plans'
import type { Actor } from './auth'

/** Plan limits for a user. Pass the actor when they are that user, so admins skip limits. */
export async function entitlementFor(event: H3Event, userId: string, actor?: Actor): Promise<Entitlement> {
  if (actor && actor.id === userId && isAdminActor(event, actor)) return UNLIMITED
  const sub = await useRepositories(event).billing.getSubscription(userId)
  return sub ? entitlementOf(sub) : NO_PLAN
}

/** Limits plus the state of everything the user owns. */
export async function ownerUsage(event: H3Event, ownerId: string, actor?: Actor) {
  const ent = await entitlementFor(event, ownerId, actor)
  const rows = await useRepositories(event).trips.listOwned(ownerId)
  return { ent, rows, locked: lockedTripIds(rows, ent) }
}

/** Every locked trip the actor can see, across all the owners they share with. */
export async function visibleLockedIds(event: H3Event, actor: Actor): Promise<string[]> {
  const rows = await useRepositories(event).trips.listForUser(actor.id, actor.email)
  const owners = [...new Set(rows.map((r) => r.ownerId))]
  const usage = await Promise.all(owners.map((o) => ownerUsage(event, o, actor)))
  const visible = new Set(rows.map((r) => r.id))
  return usage.flatMap((u) => u.locked).filter((id) => visible.has(id))
}

export function planError(message: string) {
  return createError({ statusCode: 402, statusMessage: 'Butuh paket', message, data: { code: 'plan_limit' } })
}
