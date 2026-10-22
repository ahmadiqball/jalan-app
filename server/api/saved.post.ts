/** POST /api/saved — bookmark a guide or place ({ kind, refId }). */
export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const body = await readBody<{ kind?: string; refId?: string }>(event)
  const kind = body?.kind
  const refId = body?.refId
  if ((kind !== 'guide' && kind !== 'place') || !refId) throw createError({ statusCode: 400, statusMessage: 'kind/refId tidak valid' })
  await useRepositories(event).saved.add(actor.id, kind, refId)
  return { ok: true }
})
