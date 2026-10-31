/** Whether the current user is an admin, confirmed against /api/me (also refreshed
 *  by the cloud-sync plugin after sign-in; this re-check covers a missed refresh). */
export function useMe() {
  const isAdmin = useState<boolean>('me-admin', () => false)

  if (import.meta.client) {
    const { apiFetch } = useApi()
    // re-check on mount (session is restored by then) — covers a missed/raced
    // plugin refresh, e.g. the menu mounting after the OAuth redirect.
    onMounted(async () => {
      try {
        isAdmin.value = (await apiFetch<{ isAdmin: boolean }>('/api/me')).isAdmin
      } catch {
        /* keep whatever we have */
      }
    })
  }

  return { isAdmin }
}
