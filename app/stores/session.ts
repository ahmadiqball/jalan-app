import { defineStore } from 'pinia'
import { clientPersist } from '~/utils/persist'

/** Auth stub. `authed` (and the current user) persist so a refresh keeps you in. */
export const useSessionStore = defineStore(
  'session',
  () => {
    const authed = ref(false)
    const email = ref('rina@kelana.id')
    const name = ref('Rina Kartika')
    /** Supabase user id in cloud mode; null in local/guest mode. */
    const userId = ref<string | null>(null)
    /** guest = local, ephemeral, never synced to cloud. Not persisted. */
    const guest = ref(false)

    function signIn(as?: { email?: string; name?: string }) {
      if (as?.email) email.value = as.email
      if (as?.name) name.value = as.name
      guest.value = false
      authed.value = true
    }
    /** Guest trial: local + ephemeral, never cloud. */
    function signInGuest() {
      email.value = 'tamu@kelana.id'
      name.value = 'Tamu'
      userId.value = null
      guest.value = true
      authed.value = true
    }
    /** Populate from a real (Supabase) user. */
    function setUser(u: { id: string; email?: string; name?: string }) {
      userId.value = u.id
      if (u.email) email.value = u.email
      if (u.name) name.value = u.name
      guest.value = false
      authed.value = true
    }
    function signOut() {
      authed.value = false
      userId.value = null
      guest.value = false
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

    return { authed, email, name, userId, guest, initials, signIn, signInGuest, setUser, signOut }
  },
  // guest is never persisted; guest-aware storage no-ops writes during a trial
  { persist: { pick: ['authed', 'email', 'name'], storage: clientPersist } },
)
