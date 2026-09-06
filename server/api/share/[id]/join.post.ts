import type { MemberRole } from '~/types/domain'

/**
 * POST /api/share/:id/join — accept an invite link. Adds the signed-in actor
 * to the trip's members with the role the owner set on the trip (defaults to
 * "Bisa ubah"). Idempotent: owners and existing members just pass through.
 * Returns the trip id so the client can redirect into it.
 */
interface Member { id?: string; name?: string; email?: string; role?: string; status?: string }

export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const shareId = getRouterParam(event, 'id')!
  const repo = useRepositories(event).trips

  const row = await repo.getByShare(shareId)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Link undangan tidak berlaku' })

  const email = actor.email.toLowerCase()
  const data = row.data as typeof row.data & { members?: Member[]; inviteRole?: MemberRole; people?: number }
  const members = (data.members ||= [])

  // owner or already a member → nothing to do
  const already = row.ownerId === actor.id || members.some((m) => (m.email || '').toLowerCase() === email)
  if (!already) {
    const role: MemberRole = data.inviteRole === 'Hanya lihat' ? 'Hanya lihat' : 'Bisa ubah'
    members.push({
      id: 'u' + Math.random().toString(36).slice(2, 8),
      name: email.split('@')[0] || 'Anggota',
      email,
      role,
      status: 'aktif',
    })
    data.people = Math.max(1, members.length)
    await repo.replace(row.id, data)
  }

  return { id: row.id }
})
