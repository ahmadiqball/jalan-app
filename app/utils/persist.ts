/** Persistence storage for Pinia: localStorage on the client, nothing on the server. */
export const clientPersist = {
  getItem: (key: string): string | null => (import.meta.client ? localStorage.getItem(key) : null),
  setItem: (key: string, value: string): void => {
    if (import.meta.client) localStorage.setItem(key, value)
  },
  removeItem: (key: string): void => {
    if (import.meta.client) localStorage.removeItem(key)
  },
}
