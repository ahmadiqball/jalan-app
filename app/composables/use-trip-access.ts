import type { Trip } from '~/types/domain'

export type TripRole = 'owner' | 'editor' | 'viewer'

/** The current user's role on a trip, mirroring the server's rule. */
export function tripRole(trip: Pick<Trip, 'members'>, email: string): TripRole {
  const e = email.toLowerCase()
  const m = (trip.members || []).find((x) => (x.email || '').toLowerCase() === e)
  if (m?.role === 'Pemilik') return 'owner'
  if (m?.role === 'Bisa ubah') return 'editor'
  return 'viewer'
}

/** Reactive access helpers for the current session. */
export function useTripAccess() {
  const session = useSessionStore()
  const { isLocked } = useSubscription()
  const roleOf = (trip: Pick<Trip, 'members'>): TripRole => tripRole(trip, session.email)
  const canEdit = (trip: Pick<Trip, 'members' | 'id'>): boolean => {
    if (isLocked(trip.id)) return false
    const r = roleOf(trip)
    return r === 'owner' || r === 'editor'
  }
  const isOwner = (trip: Pick<Trip, 'members'>): boolean => roleOf(trip) === 'owner'
  return { roleOf, canEdit, isOwner }
}
