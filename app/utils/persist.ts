/**
 * Persistence storage for Pinia. During a GUEST session, writes are no-ops —
 * so a guest's edits live only in memory (ephemeral) and never touch
 * localStorage or the cloud. Real sessions persist to localStorage as usual.
 */
let guest = false
export function setGuestPersist(v: boolean) {
  guest = v
}

export const clientPersist = {
  getItem: (key: string): string | null => (import.meta.client ? localStorage.getItem(key) : null),
  setItem: (key: string, value: string): void => {
    if (import.meta.client && !guest) localStorage.setItem(key, value)
  },
  removeItem: (key: string): void => {
    if (import.meta.client) localStorage.removeItem(key)
  },
}
