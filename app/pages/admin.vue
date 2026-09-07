<script setup lang="ts">
import type { ContentDoc, PackRecItem, TemplateItem } from '~/types/content'
import { MATS } from '~/utils/motifs'
import { CATEGORIES } from '~/types/domain'
import { rp } from '~/utils/format'

useHead({ title: 'Admin · Jalan' })
const { flash } = useToast()
const { content, save } = useContent()
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

const matKeys = Object.keys(MATS)
const groups = ['Dokumen', 'Pakaian', 'Elektronik', 'Perlengkapan', 'Lain-lain']

// editable local copies (normalized so every template has the new fields)
const templates = ref<TemplateItem[]>([])
const recs = ref<PackRecItem[]>([])
watchEffect(() => {
  if (content.value) {
    templates.value = structuredClone(toRaw(content.value.templates)).map((t) => ({
      ...t,
      cover: t.cover ?? '',
      alloc: t.alloc ?? {},
      packing: t.packing ?? [],
    }))
    recs.value = structuredClone(toRaw(content.value.recs))
  }
})

const listInput = (arr: string[] | undefined) => (arr || []).join(', ')
const parseList = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)

// template anggaran / barang helpers
function setAlloc(t: TemplateItem, cat: string, v: number) {
  t.alloc = { ...(t.alloc || {}), [cat]: v }
}
function allocTotal(t: TemplateItem) {
  return Object.values(t.alloc || {}).reduce((n, v) => n + v, 0)
}
function addPack(t: TemplateItem) {
  ;(t.packing ||= []).push({ label: '', group: 'Perlengkapan', req: false })
}

function addTemplate() {
  templates.value.push({ id: 'tpl-' + Date.now(), name: '', sub: '', mat: 'pantai', cover: '', days: 3, plan: 0, alloc: {}, packing: [] })
}
function addRec() {
  recs.value.push({ id: 'r-' + Date.now(), label: '', group: 'Perlengkapan', req: false, url: '', mats: [], cats: [] })
}
const saving = ref(false)
async function saveAll() {
  saving.value = true
  try {
    // clean each template: drop zero allocations, blank packing rows; plan = anggaran total
    const templatesOut = templates.value.map((t) => {
      const alloc: Record<string, number> = {}
      for (const [k, v] of Object.entries(t.alloc || {})) if (v > 0) alloc[k] = v
      const packing = (t.packing || []).filter((p) => p.label.trim())
      return { ...t, alloc, packing, plan: Object.values(alloc).reduce((n, v) => n + v, 0) || t.plan }
    })
    const doc: ContentDoc = { templates: templatesOut, recs: recs.value }
    await save(doc)
    flash('Konten disimpan')
  } catch {
    flash('Gagal menyimpan')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex-1 w-full max-w-[1100px] mx-auto p-[30px_20px_60px] md:p-[30px_32px_60px] flex flex-col gap-6 anim-rise">
    <div v-if="checking" class="text-muted">Memeriksa akses…</div>
    <template v-else-if="allowed">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div class="font-display text-[32px] font-600">Admin</div>
          <div class="text-[14px] text-ink-2 mt-[4px]">Kelola template kurasi dan rekomendasi barang untuk semua pengguna.</div>
        </div>
        <CoreButton variant="primary" :disabled="saving" @click="saveAll">{{ saving ? 'Menyimpan…' : 'Simpan semua' }}</CoreButton>
      </div>

      <!-- templates -->
      <section class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="font-display text-[20px] font-600">Template</div>
          <CoreButton variant="ghost" class="!px-[14px] !py-[8px] !text-[13px]" @click="addTemplate">+ Template</CoreButton>
        </div>
        <div class="text-[12.5px] text-muted -mt-1">Template seperti bikin trip, tapi cukup atur kategori, hari, anggaran, dan barang.</div>
        <div v-for="(t, i) in templates" :key="t.id" class="card p-[16px_18px] flex flex-col gap-4">
          <div class="flex items-start justify-between gap-3">
            <div class="font-display text-[16px] font-600">{{ t.name || 'Template baru' }}</div>
            <button class="text-warn-fg text-[13px] font-600 flex items-center gap-1 hover:underline shrink-0" @click="templates.splice(i, 1)"><i class="i-lucide-trash-2 text-[14px]" /> Hapus</button>
          </div>

          <div class="flex gap-3 flex-wrap items-end">
            <div class="flex-1 min-w-[180px]"><CoreInput v-model="t.name" label="Nama" placeholder="mis. Sumba 4 hari" /></div>
            <div class="flex-1 min-w-[180px]"><CoreInput v-model="t.sub" label="Deskripsi / tempat" placeholder="mis. Waingapu, Sumba" /></div>
            <div class="w-[100px]"><CoreInput v-model.number="t.days" type="number" label="Hari" mono /></div>
          </div>

          <CoreCategoryPicker v-model:mat="t.mat" :cover="t.cover || ''" editable-image @update:cover="t.cover = $event" />

          <!-- anggaran -->
          <div>
            <div class="eyebrow mb-2">Anggaran per kategori</div>
            <div class="flex flex-col gap-2">
              <div v-for="cat in CATEGORIES" :key="cat" class="flex items-center gap-3">
                <span class="text-[13.5px] text-ink-2 flex-1">{{ cat }}</span>
                <CoreMoneyInput
                  :model-value="t.alloc?.[cat] || 0"
                  input-class="w-[150px] text-right money text-[13.5px] bg-white border border-sand-line2 rounded-[10px] px-[10px] py-[7px] outline-none focus:border-teal-600"
                  @update:model-value="setAlloc(t, cat, $event)"
                />
              </div>
            </div>
            <div class="text-[12.5px] text-muted mt-2 money">Total anggaran: {{ rp(allocTotal(t)) }}</div>
          </div>

          <!-- barang -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="eyebrow">Barang bawaan</span>
              <button class="text-[13px] font-600 text-teal-600 hover:text-teal-700" @click="addPack(t)">+ Barang</button>
            </div>
            <div class="flex flex-col gap-2">
              <div v-for="(p, pi) in t.packing" :key="pi" class="flex gap-2 items-center flex-wrap">
                <input v-model="p.label" class="field !py-[8px] flex-1 min-w-[150px]" placeholder="mis. Dry bag">
                <div class="w-[150px]"><CoreSelect v-model="p.group" :options="groups" /></div>
                <label class="flex items-center gap-1 text-[12.5px] text-ink-2 cursor-pointer"><CoreCheckbox :model-value="!!p.req" @update:model-value="p.req = $event" /> Wajib</label>
                <button class="w-[28px] h-[28px] rounded-full text-muted hover:text-warn-fg hover:bg-warn-bg flex items-center justify-center" @click="t.packing!.splice(pi, 1)"><i class="i-lucide-x text-[15px]" /></button>
              </div>
              <div v-if="!t.packing?.length" class="text-[12.5px] text-muted">Belum ada barang.</div>
            </div>
          </div>
        </div>
        <div v-if="!templates.length" class="text-muted text-[13.5px]">Belum ada template.</div>
      </section>

      <!-- recommendations -->
      <section class="flex flex-col gap-3">
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
      </section>

      <div class="flex justify-end">
        <CoreButton variant="primary" :disabled="saving" @click="saveAll">{{ saving ? 'Menyimpan…' : 'Simpan semua' }}</CoreButton>
      </div>
    </template>
  </div>
</template>
