import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

/** True when Supabase (cloud mode) is configured. */
export function cloudEnabled(event: H3Event): boolean {
  const cfg = useRuntimeConfig(event)
  return !!(cfg.supabaseUrl && cfg.supabaseServiceKey)
}

/**
 * Server-only Supabase client (service-role key). Never imported by app/ code.
 * Bypasses RLS; per-owner authorization is enforced in repositories/routes.
 */
let client: SupabaseClient | null = null
export function useSupabase(event: H3Event): SupabaseClient {
  const cfg = useRuntimeConfig(event)
  const url = cfg.supabaseUrl as string
  const key = cfg.supabaseServiceKey as string
  if (!url || !key) throw createError({ statusCode: 500, statusMessage: 'Supabase belum dikonfigurasi' })
  if (!client) client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return client
}
