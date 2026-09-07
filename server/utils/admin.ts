import type { H3Event } from 'h3'
import type { Actor } from './auth'
import { requireActor } from './auth'
import { cloudEnabled } from './supabase'

/** Built-in owner(s) — always admin, even without NUXT_ADMIN_EMAILS set. */
const OWNER_EMAILS = ['ahmadiqbalshinichi@gmail.com']

function adminEmails(event: H3Event): string[] {
  return String(useRuntimeConfig(event).adminEmails || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

/** Local mode → the single dev user is admin. Cloud → the built-in owner, or an
 *  email in NUXT_ADMIN_EMAILS. */
export function isAdminActor(event: H3Event, actor: Actor): boolean {
  if (!cloudEnabled(event)) return true
  const email = actor.email.toLowerCase()
  return OWNER_EMAILS.includes(email) || adminEmails(event).includes(email)
}

export async function requireAdmin(event: H3Event): Promise<Actor> {
  const actor = await requireActor(event)
  if (!isAdminActor(event, actor)) throw createError({ statusCode: 403, statusMessage: 'Khusus admin' })
  return actor
}
