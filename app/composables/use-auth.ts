/** Auth facade over Supabase Auth, so the UI doesn't touch the client directly. */
export function useAuth() {
  const session = useSessionStore()
  const client = useSupabaseClient()

  type Result = { ok: boolean; error?: string }

  async function signOut() {
    await client?.auth.signOut()
    session.signOut()
  }

  /** `next` survives the OAuth round trip, which always lands on /beranda. */
  async function signInGoogle(next?: string): Promise<Result> {
    if (!client) return { ok: false, error: 'Auth belum siap' }
    if (next) sessionStorage.setItem('post-login-next', next)
    const redirectTo = `${window.location.origin}/beranda`
    const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
    if (error) return { ok: false, error: error.message }
    return { ok: true } // browser redirects to Google; session resolves on return
  }

  return { signInGoogle, signOut }
}
