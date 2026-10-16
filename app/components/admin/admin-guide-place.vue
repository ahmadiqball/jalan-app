<script setup lang="ts">
import type { Place } from '~/types/guide'
import { PLACE_TYPES, placeTypeLabel, placeTypeIcon } from '~/utils/guide'

const props = defineProps<{ place: Place; startOpen?: boolean }>()
const emit = defineEmits<{ save: [Place]; remove: [] }>()

const csv = (a?: string[]) => (a || []).join(', ')
const lines = (a?: string[]) => (a || []).join('\n')
const fromCsv = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
const fromLines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)
const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) && v !== '' && v != null ? n : undefined }

// loose model: number inputs bind as strings; save() coerces back
const p = reactive<Record<string, any>>({ ...props.place })
const tagsStr = ref(csv(props.place.tags))
const galleryStr = ref(lines(props.place.gallery))
const gtkStr = ref(lines(props.place.goodToKnow))
const tipsStr = ref(lines(props.place.tips))
const open = ref(!!props.startOpen)
const saving = ref(false)

const typeOptions = PLACE_TYPES.map((t) => ({ value: t.id, label: t.label }))
const priceOptions = [
  { value: '0', label: '— tanpa level' }, { value: '1', label: 'Rp' }, { value: '2', label: 'Rp Rp' },
  { value: '3', label: 'Rp Rp Rp' }, { value: '4', label: 'Rp Rp Rp Rp' },
]

async function save() {
  saving.value = true
  try {
    emit('save', {
      ...(p as Place),
      priceLevel: num(p.priceLevel),
      rating: num(p.rating),
      ratingCount: num(p.ratingCount),
      lat: num(p.lat),
      lng: num(p.lng),
      tags: fromCsv(tagsStr.value),
      gallery: fromLines(galleryStr.value),
      goodToKnow: fromLines(gtkStr.value),
      tips: fromLines(tipsStr.value),
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="border border-sand-line2 rounded-[14px] overflow-hidden">
    <!-- header -->
    <button class="w-full flex items-center gap-3 p-[12px_14px] text-left hover:bg-sand-100 transition-colors" @click="open = !open">
      <span class="w-[30px] h-[30px] rounded-[9px] bg-paper flex items-center justify-center shrink-0"><i :class="placeTypeIcon(p.type)" class="text-[15px] text-teal-700" /></span>
      <span class="flex-1 min-w-0">
        <span class="block text-[14px] font-600 truncate">{{ p.name || 'Tempat baru' }}</span>
        <span class="block text-[12px] text-muted">{{ placeTypeLabel(p.type) }}<span v-if="p.area"> · {{ p.area }}</span></span>
      </span>
      <i class="i-lucide-chevron-down text-[17px] text-muted transition-transform" :class="open && 'rotate-180'" />
    </button>

    <!-- body -->
    <div v-if="open" class="p-[14px] pt-0 flex flex-col gap-3 border-t border-sand-line2">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
        <label class="flex flex-col gap-1 col-span-2"><span class="text-[11px] text-muted font-600">Nama</span><input v-model="p.name" class="field !py-[8px] !font-600" placeholder="Nama tempat"></label>
        <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Jenis</span><CoreSelect :model-value="p.type" :options="typeOptions" @update:model-value="p.type = $event" /></label>
        <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Area</span><input v-model="p.area" class="field !py-[8px]" placeholder="mis. Ubud"></label>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Harga (teks)</span><input v-model="p.priceText" class="field !py-[8px]" placeholder="Rp 750rb / malam"></label>
        <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Level harga</span><CoreSelect :model-value="String(p.priceLevel || 0)" :options="priceOptions" @update:model-value="p.priceLevel = parseInt($event, 10)" /></label>
        <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Rating</span><input v-model="p.rating" type="number" step="0.1" min="0" max="5" class="field !py-[8px] money" placeholder="4.7"></label>
        <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Jumlah ulasan</span><input v-model="p.ratingCount" type="number" min="0" class="field !py-[8px] money" placeholder="128"></label>
      </div>
      <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Tag (pisah koma)</span><input v-model="tagsStr" class="field !py-[8px]" placeholder="Pantai, Suasana tenang, Cocok pasangan"></label>
      <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Deskripsi singkat</span><input v-model="p.shortDesc" class="field !py-[8px]" placeholder="Satu kalimat untuk kartu"></label>
      <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Tentang (panjang)</span><textarea v-model="p.longDesc" rows="3" class="field !py-[8px] resize-none" placeholder="Paragraf 'Tentang'" /></label>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Galeri — URL gambar (satu per baris)</span><textarea v-model="galleryStr" rows="3" class="field !py-[8px] resize-none" placeholder="https://…/foto.jpg" /></label>
        <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Good to Know (satu per baris)</span><textarea v-model="gtkStr" rows="3" class="field !py-[8px] resize-none" /></label>
        <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Tips (satu per baris)</span><textarea v-model="tipsStr" rows="3" class="field !py-[8px] resize-none" /></label>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <label class="flex flex-col gap-1 md:col-span-2"><span class="text-[11px] text-muted font-600">Google Maps place_id</span><input v-model="p.gmapsPlaceId" class="field !py-[8px]" placeholder="ChIJ…"></label>
        <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Lat</span><input v-model="p.lat" type="number" step="any" class="field !py-[8px] money"></label>
        <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Lng</span><input v-model="p.lng" type="number" step="any" class="field !py-[8px] money"></label>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
        <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Jam buka</span><input v-model="p.openHours" class="field !py-[8px]" placeholder="Setiap hari 08–22"></label>
        <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Badge</span><input v-model="p.badge" class="field !py-[8px]" placeholder="Pilihan Kelana"></label>
        <label class="flex flex-col gap-1 md:col-span-2"><span class="text-[11px] text-muted font-600">URL situs</span><input v-model="p.url" class="field !py-[8px]" placeholder="https://…"></label>
      </div>
      <label class="flex items-center gap-2 text-[13px] text-ink-2 cursor-pointer"><CoreCheckbox :model-value="!!p.featured" @update:model-value="p.featured = $event" /> Tampilkan sebagai unggulan</label>

      <div class="flex items-center justify-between gap-3 pt-1">
        <button class="text-warn-fg text-[13px] font-600 flex items-center gap-2 hover:underline" @click="emit('remove')"><i class="i-lucide-trash-2 text-[14px]" /> Hapus tempat</button>
        <CoreButton variant="primary" class="!px-[18px] !py-[9px] !text-[13px]" :disabled="saving" @click="save">{{ saving ? 'Menyimpan…' : 'Simpan tempat' }}</CoreButton>
      </div>
    </div>
  </div>
</template>
