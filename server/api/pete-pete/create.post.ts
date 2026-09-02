/**
 * Proxy: create a pete-pete bill for a trip and return its id + share URL.
 * Runs on jalan's server so the browser never makes a cross-origin call to
 * petepete.in (no CORS). Body: { title: string, participants: {name}[] }.
 */
export default defineEventHandler(async (event) => {
  const base = (useRuntimeConfig(event).public.petePeteUrl as string || '').replace(/\/+$/, '')
  if (!base) {
    throw createError({ statusCode: 503, statusMessage: 'PetePete belum dikonfigurasi' })
  }

  const body = await readBody<{ title?: string; participants?: { name: string }[] }>(event)
  const title = (body?.title || '').trim() || 'Trip'
  // de-duplicate participant names (pete-pete requires unique names per bill)
  const seen = new Set<string>()
  const participants = (body?.participants || [])
    .map((p) => ({ name: (p?.name || '').trim() }))
    .filter((p) => {
      const k = p.name.toLowerCase()
      if (!p.name || seen.has(k)) return false
      seen.add(k)
      return true
    })

  try {
    const bill = await $fetch<{ id: string }>(`${base}/api/bills`, {
      method: 'POST',
      body: { title, participants },
    })
    return { id: bill.id, url: `${base}/bill/${bill.id}` }
  } catch (e: unknown) {
    throw createError({ statusCode: 502, statusMessage: 'Gagal membuat split di PetePete' })
  }
})
