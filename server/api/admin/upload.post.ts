import { cloudEnabled, useSupabase } from '../../utils/supabase'

const BUCKET = 'guides'
const MAX = 6 * 1024 * 1024 // 6MB

/** POST /api/admin/upload — admin image upload to Supabase Storage (public
 *  bucket), returns the public URL. Cloud only; local mode pastes URLs. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  if (!cloudEnabled(event)) {
    throw createError({ statusCode: 400, statusMessage: 'Upload gambar hanya tersedia di mode cloud. Tempel URL gambar sebagai gantinya.' })
  }

  const parts = await readMultipartFormData(event)
  const file = parts?.find((p) => p.name === 'file' && p.filename)
  if (!file || !file.data?.length) throw createError({ statusCode: 400, statusMessage: 'Tidak ada file' })
  if (!(file.type || '').startsWith('image/')) throw createError({ statusCode: 400, statusMessage: 'File harus berupa gambar' })
  if (file.data.length > MAX) throw createError({ statusCode: 400, statusMessage: 'Gambar maksimal 6MB' })

  const sb = useSupabase(event)
  // ensure the public bucket exists (idempotent)
  await sb.storage.createBucket(BUCKET, { public: true }).catch(() => {})

  const ext = (file.filename!.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
  const path = `places/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const { error } = await sb.storage.from(BUCKET).upload(path, file.data, { contentType: file.type, upsert: false })
  if (error) throw createError({ statusCode: 500, statusMessage: 'Gagal mengunggah: ' + error.message })

  const url = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  return { url }
})
