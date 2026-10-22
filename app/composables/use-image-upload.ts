/** Admin image upload → Supabase Storage, returns the public URL (cloud only). */
export function useImageUpload() {
  const { apiFetch } = useApi()
  const { flash } = useToast()
  const cloud = useIsCloud()
  const uploading = ref(false)

  async function upload(file: File | undefined | null): Promise<string | null> {
    if (!file) return null
    if (!file.type.startsWith('image/')) { flash('File harus berupa gambar'); return null }
    uploading.value = true
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await apiFetch<{ url: string }>('/api/admin/upload', { method: 'POST', body: fd })
      return res.url
    } catch {
      flash('Gagal mengunggah gambar')
      return null
    } finally {
      uploading.value = false
    }
  }
  return { cloud, uploading, upload }
}
