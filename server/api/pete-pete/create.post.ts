/**
 * Proxy: create a pete-pete bill for a trip AND inject its recorded spending.
 * Runs on jalan's server so the browser never makes a cross-origin call.
 * Body: {
 *   title, participants: {name}[],
 *   entries?: { title, amount, payer?: name, sharers?: name[] }[]   // payer/sharers are member NAMES
 * }
 * Flow: create the bill → map member name → pete-pete participantId → POST each
 * expense as a simple, equally-split entry.
 */
interface EntryIn { title: string; amount: number; payer?: string; sharers?: string[] }

export default defineEventHandler(async (event) => {
  const base = (useRuntimeConfig(event).public.petePeteUrl as string || '').replace(/\/+$/, '')
  if (!base) throw createError({ statusCode: 503, statusMessage: 'PetePete belum dikonfigurasi' })

  const body = await readBody<{ title?: string; participants?: { name: string }[]; entries?: EntryIn[] }>(event)
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
    const bill = await $fetch<{ id: string; participants: { id: string; name: string }[] }>(`${base}/api/bills`, {
      method: 'POST',
      body: { title, participants },
    })

    const idByName = new Map((bill.participants || []).map((p) => [p.name.trim().toLowerCase(), p.id]))
    const allIds = (bill.participants || []).map((p) => p.id)

    for (const e of body?.entries || []) {
      const amount = Math.round(e.amount || 0)
      const entryTitle = (e.title || '').trim().slice(0, 80)
      if (amount <= 0 || !entryTitle || !allIds.length) continue

      const payerId = idByName.get((e.payer || '').trim().toLowerCase()) || allIds[0]!
      let sharerIds = (e.sharers || [])
        .map((n) => idByName.get((n || '').trim().toLowerCase()))
        .filter((x): x is string => !!x)
      if (!sharerIds.length) sharerIds = allIds

      // split equally, distributing the rounding remainder onto the first sharers
      const n = sharerIds.length
      const per = Math.floor(amount / n)
      let rem = amount - per * n
      const sharers = sharerIds.map((pid) => {
        const share = per + (rem > 0 ? 1 : 0)
        if (rem > 0) rem--
        return { participantId: pid, share }
      })

      try {
        await $fetch(`${base}/api/bills/${bill.id}/entries`, {
          method: 'POST',
          body: {
            type: 'simple',
            title: entryTitle,
            amount,
            payers: [{ participantId: payerId, amount }],
            shareMethod: 'equally',
            sharers,
          },
        })
      } catch {
        // skip a rejected entry, keep injecting the rest
      }
    }

    return { id: bill.id, url: `${base}/bill/${bill.id}` }
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Gagal membuat split di PetePete' })
  }
})
