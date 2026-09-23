<script setup lang="ts">
import type { RecPlace, RecRegion } from '~/types/content'
import { REC_TYPES } from '~/types/content'

const regions = defineModel<RecRegion[]>('regions', { default: () => [] })
const places = defineModel<RecPlace[]>('places', { default: () => [] })

const rid = () => Math.random().toString(36).slice(2, 8)
const typeOptions = REC_TYPES.map((t) => ({ value: t.id, label: t.label }))
const regionOptions = computed(() => regions.value.map((r) => ({ value: r.id, label: r.label })))
const priceOptions = [
  { value: '0', label: '— tanpa harga' },
  { value: '1', label: 'Rp — murah' },
  { value: '2', label: 'Rp Rp — sedang' },
  { value: '3', label: 'Rp Rp Rp — agak mahal' },
  { value: '4', label: 'Rp Rp Rp Rp — mahal' },
]

/* ---- regions ---- */
function addRegion() {
  regions.value = [...regions.value, { id: 'rg' + rid(), label: '', aliases: [] }]
}
function patchRegion(i: number, patch: Partial<RecRegion>) {
  regions.value = regions.value.map((r, idx) => (idx === i ? { ...r, ...patch } : r))
}
function setAliases(i: number, raw: string) {
  patchRegion(i, { aliases: raw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) })
}
function removeRegion(i: number) {
  regions.value = regions.value.filter((_, idx) => idx !== i)
}

/* ---- places ---- */
function addPlace() {
  const region = regions.value[0]?.id || ''
  places.value = [...places.value, { id: 'pl' + rid(), name: '', type: 'resto', region, note: '' }]
}
function patchPlace(i: number, patch: Partial<RecPlace>) {
  places.value = places.value.map((p, idx) => (idx === i ? { ...p, ...patch } : p))
}
function setPrice(i: number, v: string) {
  const n = parseInt(v, 10)
  patchPlace(i, { priceLevel: n > 0 ? n : undefined })
}
function removePlace(i: number) {
  places.value = places.value.filter((_, idx) => idx !== i)
}

const placesByRegion = (id: string) => places.value.filter((p) => p.region === id).length
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- REGIONS: the small dictionary that resolves free-text destinations -->
    <div class="bg-white border border-sand-line rounded-[18px] p-[18px_20px]">
      <div class="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div class="font-display text-[17px] font-600">Wilayah</div>
          <div class="text-[12.5px] text-muted mt-[2px] max-w-[540px]">
            Tiap wilayah punya <span class="font-600">alias</span> (dipisah koma) — potongan kata yang dicocokkan dengan destinasi trip. Contoh: <span class="money">bali, ubud, seminyak, kuta</span> membuat trip “Villa di Ubud” cocok ke Bali.
          </div>
        </div>
        <CoreButton variant="ghost" @click="addRegion">+ Tambah wilayah</CoreButton>
      </div>

      <div class="flex flex-col gap-2 mt-3">
        <div v-for="(r, i) in regions" :key="r.id" class="flex items-center gap-2 flex-wrap">
          <input :value="r.label" placeholder="Nama wilayah" class="field !py-[8px] w-[150px]" @input="patchRegion(i, { label: ($event.target as HTMLInputElement).value })">
          <input :value="r.aliases.join(', ')" placeholder="alias, dipisah koma" class="field !py-[8px] flex-1 min-w-[200px]" @input="setAliases(i, ($event.target as HTMLInputElement).value)">
          <span class="text-[11.5px] text-muted money w-[64px] text-right">{{ placesByRegion(r.id) }} tempat</span>
          <button class="w-[30px] h-[30px] rounded-full text-muted hover:text-warn-fg hover:bg-warn-bg flex items-center justify-center shrink-0" title="Hapus wilayah" @click="removeRegion(i)"><i class="i-lucide-x text-[15px]" /></button>
        </div>
        <div v-if="!regions.length" class="text-[13px] text-muted py-2">Belum ada wilayah. Tambah minimal satu untuk mulai.</div>
      </div>
    </div>

    <!-- PLACES: the curated list; each tagged to one region -->
    <div class="bg-white border border-sand-line rounded-[18px] p-[18px_20px]">
      <div class="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div class="font-display text-[17px] font-600">Tempat</div>
          <div class="text-[12.5px] text-muted mt-[2px]">Resto, kafe, penginapan, wisata. Tag tiap tempat ke satu wilayah. Foto opsional — tempel URL gambar; kalau kosong pakai ikon.</div>
        </div>
        <CoreButton variant="primary" :disabled="!regions.length" @click="addPlace">+ Tambah tempat</CoreButton>
      </div>

      <div class="flex flex-col gap-3 mt-3">
        <div v-for="(p, i) in places" :key="p.id" class="border border-sand-line2 rounded-[14px] p-[14px] flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <input :value="p.name" placeholder="Nama tempat" class="field !py-[8px] !font-600 flex-1" @input="patchPlace(i, { name: ($event.target as HTMLInputElement).value })">
            <button class="w-[30px] h-[30px] rounded-full text-muted hover:text-warn-fg hover:bg-warn-bg flex items-center justify-center shrink-0" title="Hapus tempat" @click="removePlace(i)"><i class="i-lucide-trash-2 text-[14px]" /></button>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Jenis</span><CoreSelect :model-value="p.type" :options="typeOptions" @update:model-value="patchPlace(i, { type: $event as RecPlace['type'] })" /></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Wilayah</span><CoreSelect :model-value="p.region" :options="regionOptions" @update:model-value="patchPlace(i, { region: $event })" /></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Area (opsional)</span><input :value="p.area || ''" placeholder="mis. Ubud" class="field !py-[8px]" @input="patchPlace(i, { area: ($event.target as HTMLInputElement).value })"></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Harga</span><CoreSelect :model-value="String(p.priceLevel || 0)" :options="priceOptions" @update:model-value="setPrice(i, $event)" /></label>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input :value="p.image || ''" placeholder="URL gambar (opsional)" class="field !py-[8px]" @input="patchPlace(i, { image: ($event.target as HTMLInputElement).value })">
            <input :value="p.url || ''" placeholder="URL situs/maps (opsional)" class="field !py-[8px]" @input="patchPlace(i, { url: ($event.target as HTMLInputElement).value })">
          </div>
          <input :value="p.note || ''" placeholder="Catatan singkat (opsional)" class="field !py-[8px]" @input="patchPlace(i, { note: ($event.target as HTMLInputElement).value })">
        </div>
        <div v-if="!places.length" class="text-[13px] text-muted py-2">Belum ada tempat.</div>
      </div>
    </div>
  </div>
</template>
