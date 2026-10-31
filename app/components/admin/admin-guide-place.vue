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
const gallery = ref<string[]>([...(props.place.gallery || [])].slice(0, 5))
const galleryUrl = ref('')
const gtk = ref<string[]>([...(props.place.goodToKnow || [])])
const tipsStr = ref(lines(props.place.tips))
const open = ref(!!props.startOpen)
const saving = ref(false)

const { uploading, upload } = useImageUpload()
const galleryInput = ref<HTMLInputElement | null>(null)
async function onPickGallery(e: Event) {
  const input = e.target as HTMLInputElement
  const url = await upload(input.files?.[0])
  if (url && gallery.value.length < 5) gallery.value.push(url)
  input.value = ''
}
function addGalleryUrl() {
  const u = galleryUrl.value.trim()
  if (u && gallery.value.length < 5) { gallery.value.push(u); galleryUrl.value = '' }
}

const typeOptions = PLACE_TYPES.map((t) => ({ value: t.id, label: t.label }))

async function save() {
  saving.value = true
  try {
    emit('save', {
      ...(p as Place),
      lat: num(p.lat),
      lng: num(p.lng),
      tags: fromCsv(tagsStr.value),
      gallery: gallery.value.map((x) => x.trim()).filter(Boolean).slice(0, 5),
      goodToKnow: gtk.value.map((x) => x.trim()).filter(Boolean),
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
      <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Perkiraan harga</span><input v-model="p.priceText" class="field !py-[8px]" placeholder="mis. Rp 750rb / malam · Rp 80–150rb/orang"></label>
      <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Tag (pisah koma)</span><input v-model="tagsStr" class="field !py-[8px]" placeholder="Pantai, Suasana tenang, Cocok pasangan"></label>
      <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Deskripsi singkat</span><input v-model="p.shortDesc" class="field !py-[8px]" placeholder="Satu kalimat untuk kartu"></label>
      <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Tentang (panjang)</span><textarea v-model="p.longDesc" rows="3" class="field !py-[8px] resize-none" placeholder="Paragraf 'Tentang'" /></label>
      <!-- gallery (max 5; foto pertama = sampul) -->
      <div class="flex flex-col gap-[6px]">
        <span class="text-[11px] text-muted font-600 flex items-center justify-between"><span>Galeri foto (maks 5) — foto pertama jadi sampul kartu</span><span>{{ gallery.length }}/5</span></span>
        <div class="grid grid-cols-3 sm:grid-cols-5 gap-2">
          <div v-for="(g, i) in gallery" :key="i" class="relative aspect-[4/3] rounded-[10px] overflow-hidden border border-sand-line2 bg-paper">
            <img :src="g" alt="" class="w-full h-full object-cover">
            <span v-if="i === 0" class="absolute top-1 left-1 rounded-pill bg-teal-600 text-white text-[9.5px] font-700 px-[6px] py-[2px]">Sampul</span>
            <button type="button" class="absolute top-1 right-1 w-[20px] h-[20px] rounded-full bg-white/90 flex items-center justify-center text-muted hover:text-warn-fg shadow" title="Hapus" @click="gallery.splice(i, 1)"><i class="i-lucide-x text-[12px]" /></button>
          </div>
          <button v-if="gallery.length < 5" type="button" class="aspect-[4/3] rounded-[10px] border border-dashed border-sand-line3 flex flex-col items-center justify-center gap-1 text-muted hover:border-teal-600 hover:text-teal-700 disabled:opacity-50" :disabled="uploading" @click="galleryInput?.click()">
            <i class="i-lucide-image-plus text-[20px]" /><span class="text-[10.5px] font-600">{{ uploading ? '…' : 'Unggah' }}</span>
          </button>
        </div>
        <div v-if="gallery.length < 5" class="flex items-center gap-2">
          <input v-model="galleryUrl" class="field !py-[7px] flex-1 !text-[12px]" placeholder="atau tempel URL gambar lalu Tambah" @keydown.enter.prevent="addGalleryUrl">
          <CoreButton variant="ghost" class="!px-[12px] !py-[8px] !text-[12px] shrink-0" @click="addGalleryUrl">Tambah</CoreButton>
        </div>
        <input ref="galleryInput" type="file" accept="image/*" class="hidden" @change="onPickGallery">
      </div>
      <label class="flex flex-col gap-1"><span class="text-[11px] text-muted font-600">Tips (satu per baris)</span><textarea v-model="tipsStr" rows="3" class="field !py-[8px] resize-none" /></label>
      <div class="flex flex-col gap-1">
        <span class="text-[11px] text-muted font-600">Good to Know — satu kotak = satu poin checklist</span>
        <div class="flex flex-col gap-[6px]">
          <div v-for="(g, i) in gtk" :key="i" class="flex items-center gap-2">
            <i class="i-lucide-check text-teal-600 text-[14px] shrink-0" />
            <input v-model="gtk[i]" class="field !py-[7px] flex-1" placeholder="mis. Pesan jauh hari saat high season">
            <button type="button" class="w-[28px] h-[28px] rounded-full text-muted hover:text-warn-fg hover:bg-warn-bg flex items-center justify-center shrink-0" title="Hapus" @click="gtk.splice(i, 1)"><i class="i-lucide-x text-[14px]" /></button>
          </div>
          <button type="button" class="text-teal-700 font-600 text-[12.5px] flex items-center gap-1 w-fit mt-[2px]" @click="gtk.push('')"><i class="i-lucide-plus text-[13px]" /> Tambah poin</button>
        </div>
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
