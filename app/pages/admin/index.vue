<script setup lang="ts">
import type { PackRecItem } from '~/types/content'
import type { Destination } from '~/types/guide'
import type { Trip } from '~/types/domain'
import { rp } from '~/utils/format'

useHead({ title: 'Admin · Kelana' })
const { flash } = useToast()
const { content, save } = useContent()
const { list, ensureLoaded, create, remove } = useTemplates()
const { apiFetch } = useApi()
const { confirm } = useConfirm()
const { t } = useI18n()
const { listDestinations, saveDestination, deleteDestination } = useGuidesAdmin()

// authoritative admin gate (token-attached in cloud)
const allowed = ref(!useIsCloud())
const checking = ref(true)
onMounted(async () => {
  if (useIsCloud()) {
    try { allowed.value = (await apiFetch<{ isAdmin: boolean }>('/api/me')).isAdmin }
    catch { allowed.value = false }
  }
  checking.value = false
  if (!allowed.value) { navigateTo('/beranda'); return }
  loadDestinations()
})

const menu = ref<'templates' | 'recs' | 'guides'>('templates')

/* ---- guides (destinations) ---- */
const rid = () => Math.random().toString(36).slice(2, 8)
const destinations = ref<Destination[]>([])
async function loadDestinations() {
  try { destinations.value = await listDestinations() } catch { /* ignore */ }
}
const seeding = ref(false)
async function seedExamples() {
  seeding.value = true
  try {
    const r = await apiFetch<{ destinations: number; places: number }>('/api/admin/guides/seed', { method: 'POST' })
    await loadDestinations()
    flash(`Contoh panduan diisi — ${r.destinations} destinasi, ${r.places} tempat`)
  } catch {
    flash('Gagal mengisi contoh panduan')
  } finally {
    seeding.value = false
  }
}
async function newGuide() {
  const id = 'dest-' + rid()
  try {
    await saveDestination({ id, slug: 'panduan-' + rid(), name: 'Panduan baru', region: '', published: false } as Destination)
    navigateTo(`/admin/guide/${id}`)
  } catch { flash('Gagal membuat panduan') }
}
async function removeGuide(id: string, name: string) {
  const ok = await confirm({
    title: 'Hapus panduan?',
    message: `Panduan "${name || 'ini'}" beserta semua tempatnya akan dihapus permanen.`,
    confirmLabel: 'Hapus panduan',
    danger: true,
  })
  if (!ok) return
  try {
    await deleteDestination(id)
    destinations.value = destinations.value.filter((d) => d.id !== id)
    flash('Panduan dihapus')
  } catch { flash('Gagal menghapus') }
}

// load templates into the store so the trip tabs can edit them
watchEffect(() => ensureLoaded())

const templateTotal = (tp: Trip) => {
  const b = tp.budgets?.find((x) => x.id === tp.activeBudget) || tp.budgets?.[0]
  return Object.values(b?.alloc || {}).reduce((n, v) => n + v, 0)
}

// recs editable local copy (normalize legacy single `group` → `groups[]`)
const recs = ref<PackRecItem[]>([])
watchEffect(() => {
  if (content.value) {
    recs.value = structuredClone(toRaw(content.value.recs)).map((r) => {
      const legacy = r as PackRecItem & { group?: string }
      return { ...r, groups: legacy.groups ?? (legacy.group ? [legacy.group] : []) }
    })
  }
})

const saving = ref(false)
async function saveAll() {
  saving.value = true
  try {
    await save({ recs: recs.value })
    flash('Konten disimpan')
  } catch {
    flash('Gagal menyimpan')
  } finally {
    saving.value = false
  }
}

async function newTemplate() {
  const id = await create()
  navigateTo(`/admin/template/${id}`)
}
async function removeTemplate(id: string, name: string) {
  const ok = await confirm({
    title: t('confirm.delTplTitle'),
    message: t('confirm.delTplMsg', { name: name || 'ini' }),
    confirmLabel: t('confirm.delTplCta'),
    danger: true,
  })
  if (!ok) return
  await remove(id)
}
</script>

<template>
  <div class="flex-1 w-full max-w-[1100px] mx-auto p-[30px_20px_60px] md:p-[30px_32px_60px] flex flex-col gap-6 anim-rise">
    <div v-if="checking" class="text-muted">Memeriksa akses…</div>
    <template v-else-if="allowed">
      <div>
        <div class="font-display text-[32px] font-600">Admin</div>
        <div class="text-[14px] text-ink-2 mt-[4px]">Kelola template kurasi dan rekomendasi barang untuk semua pengguna.</div>
      </div>

      <!-- menu -->
      <div class="flex gap-1 border-b border-sand-line">
        <button
          v-for="m in [['templates', 'Template'], ['recs', 'Rekomendasi barang'], ['guides', 'Panduan']] as const"
          :key="m[0]"
          class="px-4 pt-[10px] pb-[12px] text-[14px] border-b-[2.5px] transition-colors"
          :class="menu === m[0] ? 'border-teal-600 text-ink font-700' : 'border-transparent text-muted font-500 hover:text-ink-2'"
          @click="menu = m[0]"
        >
          {{ m[1] }}
        </button>
      </div>

      <!-- TEMPLATES: grid of trip-shaped templates -->
      <template v-if="menu === 'templates'">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="text-[13.5px] text-ink-2">Tiap template dibuat seperti trip biasa — atur hari, anggaran, dan barang. Pengguna tinggal “pakai”.</div>
          <CoreButton variant="primary" @click="newTemplate">+ Template baru</CoreButton>
        </div>
        <ClientOnly>
          <div class="grid gap-[18px]" style="grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr))">
            <div v-for="tp in list" :key="tp.id" class="bg-white border border-sand-line rounded-[20px] overflow-hidden flex flex-col group">
              <div class="h-[92px] bg-cover bg-center relative" :style="tp.cover ? { backgroundImage: `url('${tp.cover}')` } : {}">
                <CoreCover v-if="!tp.cover" :mat="tp.mat" :photo-size="0" />
                <button class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-muted hover:text-warn-fg shadow" title="Hapus" @click.stop="removeTemplate(tp.id, tp.name)"><i class="i-lucide-trash-2 text-[14px]" /></button>
              </div>
              <NuxtLink :to="`/admin/template/${tp.id}`" class="p-[14px_16px] flex flex-col gap-[9px] flex-1 hover:bg-sand-100 transition-colors">
                <div>
                  <div class="font-display text-[17px] font-600">{{ tp.name || 'Template baru' }}</div>
                  <div class="text-[12.5px] text-muted mt-[2px]">{{ tp.place || 'Belum ada destinasi' }}</div>
                </div>
                <div class="flex gap-[6px] text-[12px] font-600 flex-wrap">
                  <span class="bg-paper rounded-pill px-[10px] py-[5px] text-ink-2 money">{{ tp.days.length }} hari</span>
                  <span class="bg-paper rounded-pill px-[10px] py-[5px] text-ink-2 money">{{ rp(templateTotal(tp)) }}</span>
                </div>
                <div class="mt-auto text-[12.5px] font-600 text-teal-600 flex items-center gap-1">Atur template <i class="i-lucide-arrow-up-right text-[14px]" /></div>
              </NuxtLink>
            </div>
            <button class="border border-dashed border-sand-line3 rounded-[20px] min-h-[200px] flex flex-col items-center justify-center gap-2 text-muted hover:border-teal-600 hover:text-teal-700" @click="newTemplate">
              <i class="i-lucide-plus text-[24px]" />
              <span class="text-[13px] font-600">Template baru</span>
            </button>
          </div>
          <template #fallback><SkeletonCards :count="4" /></template>
        </ClientOnly>
      </template>

      <!-- RECS (packing) -->
      <template v-else-if="menu === 'recs'">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="font-display text-[20px] font-600">Rekomendasi barang</div>
          <CoreButton variant="primary" :disabled="saving" @click="saveAll">{{ saving ? 'Menyimpan…' : 'Simpan rekomendasi' }}</CoreButton>
        </div>
        <ClientOnly>
          <AdminRecs v-model="recs" />
          <template #fallback><SkeletonRows :count="6" /></template>
        </ClientOnly>
      </template>

      <!-- GUIDES (destinations + places catalog) -->
      <template v-else>
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="text-[13.5px] text-ink-2 max-w-[560px]">Panduan destinasi dengan rekomendasi tempat (hotel, makan, aktivitas, hidden gem) yang tampil publik di <span class="money">/guides</span>.</div>
          <div class="flex items-center gap-2 shrink-0 flex-wrap">
            <CoreButton v-if="!destinations.length" variant="ghost" :disabled="seeding" @click="seedExamples">{{ seeding ? 'Mengisi…' : 'Isi contoh (Bali & Banda Neira)' }}</CoreButton>
            <CoreButton variant="primary" @click="newGuide">+ Panduan baru</CoreButton>
          </div>
        </div>
        <ClientOnly>
          <div class="grid gap-[18px]" style="grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr))">
            <div v-for="d in destinations" :key="d.id" class="bg-white border border-sand-line rounded-[20px] overflow-hidden flex flex-col group">
              <div class="h-[92px] bg-cover bg-center relative" :style="{ backgroundColor: '#DEEEEC', backgroundImage: d.heroImage ? `url('${d.heroImage}')` : undefined }">
                <span class="absolute top-2 left-2 rounded-pill px-[9px] py-[3px] text-[11px] font-700" :class="d.published ? 'bg-teal-100 text-teal-700' : 'bg-sand-100 text-muted'">{{ d.published ? 'Tayang' : 'Draf' }}</span>
                <button class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-muted hover:text-warn-fg shadow" title="Hapus" @click.stop="removeGuide(d.id, d.name)"><i class="i-lucide-trash-2 text-[14px]" /></button>
              </div>
              <NuxtLink :to="`/admin/guide/${d.id}`" class="p-[14px_16px] flex flex-col gap-[7px] flex-1 hover:bg-sand-100 transition-colors">
                <div>
                  <div class="font-display text-[17px] font-600">{{ d.name || 'Panduan baru' }}</div>
                  <div class="text-[12.5px] text-muted mt-[2px]">{{ d.region || 'Belum ada region' }}</div>
                </div>
                <div class="mt-auto text-[12.5px] font-600 text-teal-600 flex items-center gap-1">Atur panduan <i class="i-lucide-arrow-up-right text-[14px]" /></div>
              </NuxtLink>
            </div>
            <button class="border border-dashed border-sand-line3 rounded-[20px] min-h-[160px] flex flex-col items-center justify-center gap-2 text-muted hover:border-teal-600 hover:text-teal-700" @click="newGuide">
              <i class="i-lucide-plus text-[24px]" />
              <span class="text-[13px] font-600">Panduan baru</span>
            </button>
          </div>
          <template #fallback><SkeletonCards :count="4" /></template>
        </ClientOnly>
      </template>
    </template>
  </div>
</template>
