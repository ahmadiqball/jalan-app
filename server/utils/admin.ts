import type { H3Event } from 'h3'
import type { Actor } from './auth'
import { requireActor } from './auth'
import { cloudEnabled } from './supabase'

function adminEmails(event: H3Event): string[] {
  return String(useRuntimeConfig(event).adminEmails || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

/** Local mode → the single dev user is admin. Cloud → email must be allowlisted. */
export function isAdminActor(event: H3Event, actor: Actor): boolean {
  if (!cloudEnabled(event)) return true
  return adminEmails(event).includes(actor.email.toLowerCase())
}

export async function requireAdmin(event: H3Event): Promise<Actor> {
  const actor = await requireActor(event)
  if (!isAdminActor(event, actor)) throw createError({ statusCode: 403, statusMessage: 'Khusus admin' })
  return actor
}
