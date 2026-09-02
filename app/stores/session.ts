import { defineStore } from 'pinia'

/** Auth stub. `authed` (and the current user) persist so a refresh keeps you in. */
export const useSessionStore = defineStore(
  'session',
  () => {
    const authed = ref(false)
    const email = ref('rina@jalan.id')
    const name = ref('Rina Kartika')
    /** Supabase user id in cloud mode; null in local mode. */
    const userId = ref<string | null>(null)

    function signIn(as?: { email?: string; name?: string }) {
      if (as?.email) email.value = as.email
      if (as?.name) name.value = as.name
      authed.value = true
    }
    /** Populate from a real (Supabase) user. */
    function setUser(u: { id: string; email?: string; name?: string }) {
      userId.value = u.id
      if (u.email) email.value = u.email
      if (u.name) name.value = u.name
      authed.value = true
    }
    function signOut() {
      authed.value = false
      userId.value = null
    }

    const initials = computed(() =>
      name.value
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase(),
    )

    return { authed, email, name, userId, initials, signIn, setUser, signOut }
  },
  { persist: { pick: ['authed', 'email', 'name'] } },
)
