import type { Destination, GuideDetail, Place } from '~/types/guide'

/** Admin CRUD for the Guides catalog (token-attached via apiFetch). */
export function useGuidesAdmin() {
  const { apiFetch } = useApi()
  return {
    listDestinations: () => apiFetch<Destination[]>('/api/admin/destinations'),
    getDestination: (id: string) => apiFetch<GuideDetail>(`/api/admin/destinations/${id}`),
    saveDestination: (d: Destination) => apiFetch<Destination>(`/api/admin/destinations/${d.id}`, { method: 'PUT', body: d }),
    deleteDestination: (id: string) => apiFetch(`/api/admin/destinations/${id}`, { method: 'DELETE' }),
    savePlace: (p: Place) => apiFetch<Place>(`/api/admin/places/${p.id}`, { method: 'PUT', body: p }),
    deletePlace: (id: string) => apiFetch(`/api/admin/places/${id}`, { method: 'DELETE' }),
  }
}
