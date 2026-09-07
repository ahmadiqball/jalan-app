<script setup lang="ts">
import type { PackRecItem } from '~/types/content'
import type { Trip } from '~/types/domain'
import { CATEGORIES } from '~/types/domain'
import { rp } from '~/utils/format'
import { MATS } from '~/utils/motifs'

useHead({ title: 'Admin · Jalan' })
const { flash } = useToast()
const trips = useTripsStore()
const { content, save } = useContent()
const { list, ensureLoaded, create, remove } = useTemplates()
const { apiFetch } = useApi()

// authoritative admin gate (token-attached in cloud)
const allowed = ref(!useIsCloud())
const checking = ref(true)
onMounted(async () => {
  if (useIsCloud()) {
    try { allowed.value = (await apiFetch<{ isAdmin: boolean }>('/api/me')).isAdmin }
    catch { allowed.value = false }
  }
  checking.value = false
  if (!allowed.value) navigateTo('/beranda')
})

const menu = ref<'templates' | 'recs'>('templates')
const groups = ['Dokumen', 'Pakaian', 'Elektronik', 'Perlengkapan', 'Lain-lain']

// load templates into the store so the trip tabs can edit them
watchEffect(() => { if (content.value) ensureLoaded() })

const templateTotal = (tp: Trip) => {
  const b = tp.budgets?.find((x) => x.id === tp.activeBudget) || tp.budgets?.[0]
  return Object.values(b?.alloc || {}).reduce((n, v) => n + v, 0)
}

// recs editable local copy
const recs = ref<PackRecItem[]>([])
watchEffect(() => { if (content.value) recs.value = structuredClone(toRaw(content.value.recs)) })
const matKeys = Object.keys(MATS)
const listInput = (arr: string[] | undefined) => (arr || []).join(', ')
const parseList = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
function addRec() {
  recs.value.push({ id: 'r-' + Date.now(), label: '', group: 'Perlengkapan', req: false, url: '', mats: [], cats: [] })
}

const saving = ref(false)
async function saveAll() {
  saving.value = true
  try {
    await save({ templates: trips.templateTrips as Trip[], recs: recs.value })
    flash('Konten disimpan')
  } catch {
    flash('Gagal menyimpan')
  } finally {
    saving.value = false
  }
}

function newTemplate() {
  const id = create()
  navigateTo(`/admin/template/${id}`)
}
async function removeTemplate(id: string) {
  remove(id)
  await saveAll()
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
          v-for="m in [['templates', 'Template'], ['recs', 'Rekomendasi barang']] as const"
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
                <button class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-muted hover:text-warn-fg shadow" title="Hapus" @click.stop="removeTemplate(tp.id)"><i class="i-lucide-trash-2 text-[14px]" /></button>
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
          <template #fallback><div class="card p-8 text-muted">Memuat…</div></template>
        </ClientOnly>
      </template>

      <!-- RECS -->
      <template v-else>
        <div class="flex items-center justify-between">
          <div class="font-display text-[20px] font-600">Rekomendasi barang</div>
          <CoreButton variant="ghost" class="!px-[14px] !py-[8px] !text-[13px]" @click="addRec">+ Barang</CoreButton>
        </div>
        <div class="text-[12.5px] text-muted -mt-1">Motif &amp; kategori dipisah koma. Motif: {{ matKeys.join(', ') }}. Kategori aktivitas: {{ CATEGORIES.join(', ') }}.</div>
        <div v-for="(r, i) in recs" :key="r.id" class="card p-[14px_16px] flex flex-col gap-3">
          <div class="flex gap-3 flex-wrap items-end">
            <div class="flex-1 min-w-[180px]"><CoreInput v-model="r.label" label="Nama barang" placeholder="mis. Dry bag" /></div>
            <label class="flex flex-col gap-[7px]"><span class="text-[12.5px] font-600 text-ink-2">Grup</span><CoreSelect v-model="r.group" :options="groups" /></label>
            <label class="flex items-center gap-2 text-[13px] text-ink-2 pb-[10px] cursor-pointer"><CoreCheckbox :model-value="!!r.req" @update:model-value="r.req = $event" /> Wajib</label>
          </div>
          <div class="flex gap-3 flex-wrap items-end">
            <div class="flex-1 min-w-[200px]"><CoreInput :model-value="r.url || ''" label="Link beli (opsional)" placeholder="https://…" @update:model-value="r.url = $event" /></div>
            <div class="w-[160px]"><CoreInput :model-value="listInput(r.mats)" label="Motif" placeholder="pantai, gunung" @update:model-value="r.mats = parseList($event)" /></div>
            <div class="w-[200px]"><CoreInput :model-value="listInput(r.cats)" label="Kategori aktivitas" placeholder="Tiket & atraksi" @update:model-value="r.cats = parseList($event)" /></div>
            <button class="ml-auto text-warn-fg text-[13px] font-600 flex items-center gap-1 hover:underline pb-[10px]" @click="recs.splice(i, 1)"><i class="i-lucide-trash-2 text-[14px]" /> Hapus</button>
          </div>
        </div>
        <div v-if="!recs.length" class="text-muted text-[13.5px]">Belum ada rekomendasi.</div>
        <div class="flex justify-end">
          <CoreButton variant="primary" :disabled="saving" @click="saveAll">{{ saving ? 'Menyimpan…' : 'Simpan rekomendasi' }}</CoreButton>
        </div>
      </template>
    </template>
  </div>
</template>
