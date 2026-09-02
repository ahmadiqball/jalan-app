/**
 * Auth facade. Cloud mode → Supabase Auth; local mode → the offline stub.
 * UI (login) calls these without knowing which mode is active.
 */
export function useAuth() {
  const session = useSessionStore()
  const client = useSupabaseClient()
  const cloud = computed(() => useIsCloud())

  type Result = { ok: boolean; error?: string; needConfirm?: boolean }

  function applyUser(u: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) {
    session.setUser({
      id: u.id,
      email: u.email || undefined,
      name: (u.user_metadata?.name as string) || u.email?.split('@')[0] || 'Kamu',
    })
  }

  async function signIn(email: string, pw: string): Promise<Result> {
    if (!cloud.value || !client) {
      session.signIn({ email })
      return { ok: true }
    }
    const { data, error } = await client.auth.signInWithPassword({ email, password: pw })
    if (error) return { ok: false, error: error.message }
    if (data.user) applyUser(data.user)
    return { ok: true }
  }

  async function signUp(email: string, pw: string, name: string): Promise<Result> {
    if (!cloud.value || !client) {
      session.signIn({ email, name })
      return { ok: true }
    }
    const { data, error } = await client.auth.signUp({ email, password: pw, options: { data: { name } } })
    if (error) return { ok: false, error: error.message }
    if (data.user && data.session) applyUser(data.user)
    return { ok: true, needConfirm: !data.session }
  }

  async function signOut() {
    if (cloud.value && client) await client.auth.signOut()
    session.signOut()
  }

  /** Local-only guest bypass. */
  function guest() {
    session.signIn({ email: 'tamu@jalan.id', name: 'Tamu' })
  }

  return { cloud, signIn, signUp, signOut, guest }
}
