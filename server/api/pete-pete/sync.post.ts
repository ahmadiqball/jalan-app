/**
 * Proxy: create AND/OR reconcile a pete-pete bill from a trip's recorded
 * spending. Runs on jalan's server so the browser never makes a cross-origin
 * call. Idempotent — safe to run on every sync.
 *
 * Body: {
 *   billId?: string,                 // omit to create a fresh bill
 *   title?: string,
 *   participants?: { name }[],       // seed members (create path)
 *   entries?: KeyedEntry[],          // desired jalan-managed entries
 *   map?: Record<jalanKey, entryId>  // last-known jalan line -> pete entry id
 * }
 * where KeyedEntry = { key, title, amount, payer?: name, sharers?: name[] }.
 *
 * Returns { id, url, map } — `map` is the reconciled jalanKey -> entryId ledger
 * to persist back on the trip. Only entries this endpoint created are ever
 * updated/deleted; anything added directly in pete-pete is left alone.
 */
interface KeyedEntry { key: string; title: string; amount: number; payer?: string; sharers?: string[] }
interface PeteParticipant { id: string; name: string }
interface PeteEntry { id: string; title?: string }
interface PeteBill { id: string; participants: PeteParticipant[]; entries: PeteEntry[] }

const clip = (s: string) => (s || '').trim().slice(0, 40)
const norm = (s: string) => clip(s).toLowerCase()

export default defineEventHandler(async (event) => {
  const base = (useRuntimeConfig(event).public.petePeteUrl as string || '').replace(/\/+$/, '')
  if (!base) throw createError({ statusCode: 503, statusMessage: 'PetePete belum dikonfigurasi' })

  const body = await readBody<{
    billId?: string
    title?: string
    participants?: { name: string }[]
    entries?: KeyedEntry[]
    map?: Record<string, string>
  }>(event)

  const title = (body?.title || '').trim().slice(0, 80) || 'Trip'
  const entries = body?.entries || []
  const prevMap = body?.map || {}

  try {
    // 1) get the existing bill, or create a fresh one seeded with participants
    let bill: PeteBill
    let existing: PeteBill | null = null
    if (body?.billId) {
      existing = await $fetch<PeteBill>(`${base}/api/bills/${body.billId}`).catch(() => null)
    }
    if (existing) {
      bill = existing
    } else {
      const seen = new Set<string>()
      const participants = (body?.participants || [])
        .map((p) => ({ name: clip(p?.name || '') }))
        .filter((p) => {
          const k = p.name.toLowerCase()
          if (!p.name || seen.has(k)) return false
          seen.add(k)
          return true
        })
      bill = await $fetch<PeteBill>(`${base}/api/bills`, { method: 'POST', body: { title, participants } })
    }

    const idByName = () => new Map(bill.participants.map((p) => [norm(p.name), p.id]))

    // 2) ensure every name referenced by an entry exists as a participant
    let names = idByName()
    for (const e of entries) {
      for (const raw of [e.payer, ...(e.sharers || [])]) {
        if (!raw || names.has(norm(raw))) continue
        const updated = await $fetch<PeteBill>(`${base}/api/bills/${bill.id}/participants`, {
          method: 'POST',
          body: { name: clip(raw) },
        }).catch(() => null)
        if (updated) { bill = updated; names = idByName() }
      }
    }

    const allIds = bill.participants.map((p) => p.id)
    if (!allIds.length) return { id: bill.id, url: `${base}/bill/${bill.id}`, map: {} }

    const existingIds = new Set(bill.entries.map((e) => e.id))
    const newMap: Record<string, string> = {}

    // 3) create or update each desired entry
    for (const e of entries) {
      const amount = Math.round(e.amount || 0)
      const entryTitle = (e.title || '').trim().slice(0, 80)
      if (amount <= 0 || !entryTitle) continue

      const payerId = names.get(norm(e.payer || '')) || allIds[0]!
      let sharerIds = (e.sharers || []).map((n) => names.get(norm(n))).filter((x): x is string => !!x)
      if (!sharerIds.length) sharerIds = allIds

      // split equally, distributing the rounding remainder onto the first sharers
      const per = Math.floor(amount / sharerIds.length)
      let rem = amount - per * sharerIds.length
      const sharers = sharerIds.map((pid) => {
        const share = per + (rem > 0 ? 1 : 0)
        if (rem > 0) rem--
        return { participantId: pid, share }
      })
      const payload = {
        type: 'simple' as const,
        title: entryTitle,
        amount,
        payers: [{ participantId: payerId, amount }],
        shareMethod: 'equally' as const,
        sharers,
      }

      const prevId = prevMap[e.key]
      try {
        if (prevId && existingIds.has(prevId)) {
          await $fetch(`${base}/api/bills/${bill.id}/entries/${prevId}`, { method: 'PUT', body: payload })
          newMap[e.key] = prevId
        } else {
          const updated = await $fetch<PeteBill>(`${base}/api/bills/${bill.id}/entries`, { method: 'POST', body: payload })
          const created = updated.entries[updated.entries.length - 1]
          if (created) {
            newMap[e.key] = created.id
            existingIds.add(created.id)
            bill = updated
          }
        }
      } catch {
        // keep the previous mapping if the write failed, so we retry next sync
        if (prevId) newMap[e.key] = prevId
      }
    }

    // 4) delete jalan-managed entries whose source line is gone
    const wanted = new Set(entries.map((e) => e.key))
    for (const [key, id] of Object.entries(prevMap)) {
      if (wanted.has(key) || !existingIds.has(id)) continue
      await $fetch(`${base}/api/bills/${bill.id}/entries/${id}`, { method: 'DELETE' }).catch(() => {})
    }

    return { id: bill.id, url: `${base}/bill/${bill.id}`, map: newMap }
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Gagal sinkron ke PetePete' })
  }
})
