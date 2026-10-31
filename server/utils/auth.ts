import type { H3Event } from 'h3'
import { useSupabase } from './supabase'

export interface Actor {
  id: string
  email: string
}

/** Verify the Supabase JWT from Authorization: Bearer. Null when missing or invalid. */
export async function getActor(event: H3Event): Promise<Actor | null> {
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
