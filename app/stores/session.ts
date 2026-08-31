import { defineStore } from 'pinia'

/** Auth stub. `authed` (and the current user) persist so a refresh keeps you in. */
export const useSessionStore = defineStore(
  'session',
  () => {
    const authed = ref(false)
    const email = ref('rina@jalan.id')
    const name = ref('Rina Kartika')

    function signIn(as?: { email?: string; name?: string }) {
      if (as?.email) email.value = as.email
      if (as?.name) name.value = as.name
      authed.value = true
    }
    function signOut() {
      authed.value = false
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

    return { authed, email, name, initials, signIn, signOut }
  },
  { persist: { pick: ['authed', 'email', 'name'] } },
)
