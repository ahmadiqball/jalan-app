import { defineStore } from 'pinia'
import { clientPersist } from '~/utils/persist'

/** `authed` and the current user persist so a refresh keeps you in. */
export const useSessionStore = defineStore(
  'session',
  () => {
    const authed = ref(false)
    const email = ref('')
    const name = ref('')
    /** Supabase user id. */
    const userId = ref<string | null>(null)

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

    return { authed, email, name, userId, initials, setUser, signOut }
  },
  { persist: { pick: ['authed', 'email', 'name'], storage: clientPersist } },
)
