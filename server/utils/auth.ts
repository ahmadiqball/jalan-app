import type { H3Event } from 'h3'
import { cloudEnabled, useSupabase } from './supabase'

/** Fixed owner used in local (no-Supabase) mode so the API works offline. */
export const LOCAL_USER = { id: 'local-dev-user', email: 'local@jalan.id' }

export interface Actor {
  id: string
  email: string
}

/**
 * Resolve the authenticated actor.
 * - Cloud mode: verify the Supabase JWT from Authorization: Bearer.
 * - Local mode: a single shared dev user (no auth).
 * Returns null in cloud mode when the token is missing/invalid.
 */
export async function getActor(event: H3Event): Promise<Actor | null> {
  if (!cloudEnabled(event)) return { ...LOCAL_USER }

  const header = getRequestHeader(event, 'authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null

  const { data, error } = await useSupabase(event).auth.getUser(token)
  if (error || !data.user) return null
  return { id: data.user.id, email: (data.user.email || '').toLowerCase() }
}

export async function requireActor(event: H3Event): Promise<Actor> {
  const actor = await getActor(event)
  if (!actor) throw createError({ statusCode: 401, statusMessage: 'Harus masuk dulu' })
  return actor
}
