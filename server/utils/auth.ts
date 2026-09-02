import type { H3Event } from 'h3'
import { cloudEnabled, useSupabase } from './supabase'

/** Fixed owner id used in local (no-Supabase) mode so the API works offline. */
export const LOCAL_USER_ID = 'local-dev-user'

/**
 * Resolve the authenticated user id.
 * - Cloud mode: verify the Supabase JWT from the Authorization: Bearer header.
 * - Local mode: a single shared dev user (no auth) so the API is usable.
 * Returns null in cloud mode when the token is missing/invalid.
 */
export async function getUserId(event: H3Event): Promise<string | null> {
  if (!cloudEnabled(event)) return LOCAL_USER_ID

  const header = getRequestHeader(event, 'authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null

  const { data, error } = await useSupabase(event).auth.getUser(token)
  if (error || !data.user) return null
  return data.user.id
}

/** Same as getUserId but throws 401 when unauthenticated. */
export async function requireUserId(event: H3Event): Promise<string> {
  const id = await getUserId(event)
  if (!id) throw createError({ statusCode: 401, statusMessage: 'Harus masuk dulu' })
  return id
}
