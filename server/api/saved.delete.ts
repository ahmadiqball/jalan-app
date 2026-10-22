/** DELETE /api/saved — remove a bookmark ({ kind, refId }). */
export default defineEventHandler(async (event) => {
  const actor = await requireActor(event)
  const body = await readBody<{ kind?: string; refId?: string }>(event)
  const kind = body?.kind
  const refId = body?.refId
  if (!kind || !refId) throw createError({ statusCode: 400, statusMessage: 'kind/refId wajib' })
  await useRepositories(event).saved.remove(actor.id, kind, refId)
  return { ok: true }
})
