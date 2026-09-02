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
