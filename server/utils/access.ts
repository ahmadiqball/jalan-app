import type { TripRow } from '../repositories/types'
import type { Actor } from './auth'

export type Role = 'owner' | 'editor' | 'viewer'

interface Member { email?: string; role?: string }

/** The actor's role on a trip, or null if they have no access. */
export function roleFor(row: TripRow, actor: Actor): Role | null {
  if (row.ownerId === actor.id) return 'owner'
  const email = actor.email.toLowerCase()
  const members = (row.data.members as Member[] | undefined) || []
  const m = members.find((x) => (x.email || '').toLowerCase() === email)
  if (!m) return null
  if (m.role === 'Pemilik' || m.role === 'Bisa ubah') return 'editor'
  return 'viewer' // 'Hanya lihat' (or any other)
}

export const canRead = (r: Role | null): r is Role => r !== null
export const canWrite = (r: Role | null): boolean => r === 'owner' || r === 'editor'

interface MemberRec { id?: string; email?: string; role?: string }
const memberKey = (m: MemberRec) => (m.id || (m.email || '').toLowerCase())

/** True if `next` removes a member from `prev` or changes anyone's role —
 *  changes only the owner is allowed to make. */
export function revokesOrRerolesMembers(prev: MemberRec[], next: MemberRec[]): boolean {
  const byKey = new Map(next.map((m) => [memberKey(m), m]))
  for (const p of prev) {
    const n = byKey.get(memberKey(p))
    if (!n) return true // member removed
    if ((n.role || '') !== (p.role || '')) return true // role changed
  }
  return false
}
