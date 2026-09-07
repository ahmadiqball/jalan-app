<script setup lang="ts">
import type { PackRecItem } from '~/types/content'
import { CATEGORIES } from '~/types/domain'
import { MATS } from '~/utils/motifs'

const recs = defineModel<PackRecItem[]>({ required: true })

const GROUPS = ['Dokumen', 'Pakaian', 'Elektronik', 'Perlengkapan', 'Lain-lain']
const CATS = [...CATEGORIES] as string[]
const MAT_KEYS = Object.keys(MATS)

// filters
const filterGroup = ref('')
const filterCat = ref('')
const filtered = computed(() =>
  recs.value.filter((r) => {
    if (filterGroup.value && !r.groups?.includes(filterGroup.value)) return false
    if (filterCat.value && !(r.cats || []).includes(filterCat.value)) return false
    return true
  }),
)

// add / edit modal
const open = ref(false)
const editIndex = ref<number | null>(null)
const draft = ref<PackRecItem>(blank())
function blank(): PackRecItem {
  return { id: 'r-' + Date.now(), label: '', groups: ['Perlengkapan'], req: false, url: '', mats: [], cats: [] }
}
function openAdd() {
  editIndex.value = null
  draft.value = blank()
  open.value = true
}
function openEdit(r: PackRecItem) {
  editIndex.value = recs.value.indexOf(r)
  draft.value = structuredClone(toRaw(r))
  draft.value.mats ||= []
  draft.value.cats ||= []
  draft.value.groups ||= []
  open.value = true
}
function toggle(field: 'groups' | 'mats' | 'cats', v: string) {
  const arr = (draft.value[field] ||= [])
  const i = arr.indexOf(v)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(v)
}
function apply() {
  if (!draft.value.label.trim()) return
  const item = { ...draft.value, label: draft.value.label.trim() }
  if (editIndex.value === null) recs.value = [...recs.value, item]
  else recs.value = recs.value.map((r, i) => (i === editIndex.value ? item : r))
  open.value = false
}
function removeRow(r: PackRecItem) {
  recs.value = recs.value.filter((x) => x !== r)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- toolbar: filters + add -->
    <div class="flex items-end gap-3 flex-wrap">
      <label class="flex flex-col gap-[6px]">
        <span class="text-[12px] font-600 text-ink-2">Kategori aktivitas</span>
        <CoreSelect v-model="filterCat" :options="[{ value: '', label: 'Semua' }, ...CATS.map((c) => ({ value: c, label: c }))]" />
      </label>
      <label class="flex flex-col gap-[6px]">
        <span class="text-[12px] font-600 text-ink-2">Grup barang</span>
        <CoreSelect v-model="filterGroup" :options="[{ value: '', label: 'Semua' }, ...GROUPS.map((g) => ({ value: g, label: g }))]" />
      </label>
      <div class="ml-auto"><CoreButton variant="primary" @click="openAdd">+ Barang</CoreButton></div>
    </div>

    <!-- table -->
    <div class="card overflow-x-auto">
      <div class="min-w-[720px]">
        <div class="flex items-center gap-4 px-[18px] py-[11px] border-b border-sand-line">
          <span class="eyebrow flex-1">Barang</span>
          <span class="eyebrow w-[200px]">Grup</span>
          <span class="eyebrow w-[180px]">Kategori aktivitas</span>
          <span class="eyebrow w-[70px] text-center">Wajib</span>
          <span class="eyebrow w-[70px]" />
        </div>
        <div v-for="r in filtered" :key="r.id" class="flex items-center gap-4 px-[18px] py-[11px] border-b border-sand-100 last:border-0">
          <div class="flex-1 min-w-0">
            <div class="text-[14px] font-600 truncate">{{ r.label || '—' }}</div>
            <a v-if="r.url" :href="r.url" target="_blank" rel="noopener" class="text-[11.5px] text-teal-600 truncate inline-flex items-center gap-1">Link beli <i class="i-lucide-external-link text-[11px]" /></a>
            <span v-if="r.mats?.length" class="text-[11.5px] text-muted"> · motif {{ r.mats.join(', ') }}</span>
          </div>
          <div class="w-[200px] flex flex-wrap gap-1">
            <span v-for="g in r.groups" :key="g" class="rounded-pill bg-teal-100 text-teal-700 px-[9px] py-[3px] text-[11px] font-600">{{ g }}</span>
          </div>
          <div class="w-[180px] text-[12.5px] text-ink-2 truncate">{{ (r.cats || []).join(', ') || '—' }}</div>
          <div class="w-[70px] text-center">
            <i v-if="r.req" class="i-lucide-check text-teal-600 text-[16px]" />
            <span v-else class="text-muted">–</span>
          </div>
          <div class="w-[70px] flex justify-end gap-1">
            <button class="w-[30px] h-[30px] rounded-full text-muted hover:text-teal-700 hover:bg-teal-100 flex items-center justify-center" title="Ubah" @click="openEdit(r)"><i class="i-lucide-pencil text-[14px]" /></button>
            <button class="w-[30px] h-[30px] rounded-full text-muted hover:text-warn-fg hover:bg-warn-bg flex items-center justify-center" title="Hapus" @click="removeRow(r)"><i class="i-lucide-trash-2 text-[14px]" /></button>
          </div>
        </div>
        <div v-if="!filtered.length" class="px-[18px] py-8 text-muted text-[13.5px]">Tidak ada barang untuk filter ini.</div>
      </div>
    </div>

    <!-- add / edit modal -->
    <CoreDialog v-model:open="open" side="center" :width="520" :title="editIndex === null ? 'Tambah barang' : 'Ubah barang'">
      <div class="flex flex-col gap-4">
        <CoreInput v-model="draft.label" label="Nama barang" placeholder="mis. Dry bag" />
        <CoreInput :model-value="draft.url || ''" label="Link beli (opsional)" placeholder="https://…" @update:model-value="draft.url = $event" />

        <div>
          <span class="text-[12.5px] font-600 text-ink-2">Grup barang (boleh lebih dari satu)</span>
          <div class="flex flex-wrap gap-2 mt-2">
            <button
              v-for="g in GROUPS"
              :key="g"
              type="button"
              class="rounded-pill px-[12px] py-[6px] text-[12.5px] font-600 border transition-colors"
              :class="draft.groups?.includes(g) ? 'border-teal-600 bg-teal-100 text-teal-700' : 'border-sand-line text-muted hover:border-teal-600'"
              @click="toggle('groups', g)"
            >
              {{ g }}
            </button>
          </div>
        </div>

        <div>
          <span class="text-[12.5px] font-600 text-ink-2">Muncul untuk kategori aktivitas (kosong = semua)</span>
          <div class="flex flex-wrap gap-2 mt-2">
            <button
              v-for="c in CATS"
              :key="c"
              type="button"
              class="rounded-pill px-[12px] py-[6px] text-[12.5px] font-600 border transition-colors"
              :class="draft.cats?.includes(c) ? 'border-teal-600 bg-teal-100 text-teal-700' : 'border-sand-line text-muted hover:border-teal-600'"
              @click="toggle('cats', c)"
            >
              {{ c }}
            </button>
          </div>
        </div>

        <div>
          <span class="text-[12.5px] font-600 text-ink-2">Muncul untuk motif (kosong = semua)</span>
          <div class="flex flex-wrap gap-2 mt-2">
            <button
              v-for="m in MAT_KEYS"
              :key="m"
              type="button"
              class="rounded-pill px-[12px] py-[6px] text-[12.5px] font-600 border transition-colors"
              :class="draft.mats?.includes(m) ? 'border-teal-600 bg-teal-100 text-teal-700' : 'border-sand-line text-muted hover:border-teal-600'"
              @click="toggle('mats', m)"
            >
              {{ m }}
            </button>
          </div>
        </div>

        <label class="flex items-center gap-2 text-[13.5px] text-ink-2 cursor-pointer">
          <CoreCheckbox :model-value="!!draft.req" @update:model-value="draft.req = $event" /> Barang wajib
        </label>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <CoreButton variant="ghost" class="!px-[16px] !py-[10px] !text-[13.5px]" @click="open = false">Batal</CoreButton>
          <CoreButton variant="primary" class="!px-[18px] !py-[10px] !text-[13.5px]" @click="apply">{{ editIndex === null ? 'Tambah' : 'Simpan' }}</CoreButton>
        </div>
      </template>
    </CoreDialog>
  </div>
</template>
