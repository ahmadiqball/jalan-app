<script setup lang="ts">
import type { Destination, GuideDetail, Place } from '~/types/guide'
import { PLACE_TYPES } from '~/utils/guide'

useHead({ title: 'Atur panduan · Kelana' })
const route = useRoute()
const { flash } = useToast()
const { confirm } = useConfirm()
const { getDestination, saveDestination, savePlace, deletePlace } = useGuidesAdmin()
const { templates } = useTemplatesList()
const id = route.params.id as string

const templateOptions = computed(() => [
  { value: '', label: '— Tidak ada —' },
  ...templates.value.map((t) => ({ value: t.id, label: t.name })),
])


const csv = (a?: string[]) => (a || []).join(', ')
const linesOf = (a?: string[]) => (a || []).join('\n')
const fromCsv = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean)
const fromLines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)
const rid = () => Math.random().toString(36).slice(2, 8)

const loading = ref(true)
const dest = reactive<Record<string, any>>({})
const places = ref<Place[]>([])
// array fields edited as text
const goodForStr = ref('')
const tripTypesStr = ref('')
const aliasesStr = ref('')
const tipsStr = ref('')

onMounted(async () => {
  try {
    const d = (await getDestination(id)) as GuideDetail
    Object.assign(dest, d)
    places.value = d.places || []
    goodForStr.value = csv(d.goodFor)
    tripTypesStr.value = csv(d.tripTypes)
    aliasesStr.value = csv(d.aliases)
    tipsStr.value = linesOf(d.tips)
  } catch {
    flash('Tidak bisa memuat panduan')
    navigateTo('/admin')
    return
  } finally {
    loading.value = false
  }
})

const savingDest = ref(false)
async function saveDest() {
  savingDest.value = true
  try {
    const payload: Destination = {
      ...(dest as Destination),
      id,
      goodFor: fromCsv(goodForStr.value),
      tripTypes: fromCsv(tripTypesStr.value),
      aliases: fromCsv(aliasesStr.value),
      tips: fromLines(tipsStr.value),
    }
    const saved = await saveDestination(payload)
    Object.assign(dest, saved)
    flash('Panduan disimpan')
  } catch {
    flash('Gagal menyimpan panduan')
  } finally {
    savingDest.value = false
  }
}

const newPlaceId = ref<string | null>(null)
const typeOptions = PLACE_TYPES.map((t) => ({ value: t.id, label: t.label }))
const placeModalOpen = ref(false)
const draft = reactive({ name: '', type: 'aktivitas', area: '' })
function openAddPlace() {
  draft.name = ''
  draft.type = 'aktivitas'
  draft.area = ''
  placeModalOpen.value = true
}
async function createPlace() {
  const name = draft.name.trim()
  if (!name) return
  const pid = 'pl-' + rid()
  const p: Place = { id: pid, destinationId: id, name, type: draft.type, area: draft.area.trim() || undefined }
  try {
    const saved = await savePlace(p)
    places.value = [...places.value, saved]
    newPlaceId.value = pid
    placeModalOpen.value = false
    flash('Tempat ditambahkan — lengkapi detailnya di bawah')
  } catch {
    flash('Gagal menambah tempat')
  }
}
async function onSavePlace(p: Place) {
  try {
    const saved = await savePlace({ ...p, destinationId: id })
    places.value = places.value.map((x) => (x.id === saved.id ? saved : x))
    flash('Tempat disimpan')
  } catch {
    flash('Gagal menyimpan tempat')
  }
}
async function onRemovePlace(p: Place) {
  const ok = await confirm({ title: 'Hapus tempat?', message: `"${p.name}" akan dihapus dari panduan.`, confirmLabel: 'Hapus', danger: true })
  if (!ok) return
  try {
    await deletePlace(p.id)
    places.value = places.value.filter((x) => x.id !== p.id)
    flash('Tempat dihapus')
  } catch {
    flash('Gagal menghapus')
  }
}
</script>

<template>
  <div class="flex-1 w-full max-w-[1000px] mx-auto p-[26px_20px_64px] md:p-[30px_32px_72px] flex flex-col gap-6 anim-rise">
    <NuxtLink to="/admin" class="inline-flex items-center gap-1 text-[13px] font-600 text-muted hover:text-teal-700 w-fit"><i class="i-lucide-chevron-left text-[16px]" /> Kembali ke Admin</NuxtLink>

    <div v-if="loading" class="flex flex-col gap-6">
      <CoreSkeleton class="h-8 w-1/3" />
      <div class="card p-[18px_20px] flex flex-col gap-3">
        <CoreSkeleton class="h-10 w-full" />
        <CoreSkeleton class="h-20 w-full" />
        <CoreSkeleton class="h-10 w-2/3" />
      </div>
      <SkeletonRows :count="4" />
    </div>

    <template v-else>
      <!-- destination form -->
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div class="font-display text-[26px] font-600">{{ dest.name || 'Panduan' }}</div>
        <div class="flex items-center gap-3">
          <a :href="`/guides/${dest.slug}`" target="_blank" rel="noopener" class="text-[13px] font-600 text-teal-600 hover:text-teal-700 flex items-center gap-1"><i class="i-lucide-external-link text-[14px]" /> Pratinjau</a>
          <CoreButton variant="primary" :disabled="savingDest" @click="saveDest">{{ savingDest ? 'Menyimpan…' : 'Simpan panduan' }}</CoreButton>
        </div>
      </div>

      <div class="card p-[18px_20px] flex flex-col gap-3">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label class="flex flex-col gap-1"><span class="text-[11.5px] text-muted font-600">Nama destinasi</span><input v-model="dest.name" class="field !py-[9px] !font-600" placeholder="mis. Bali"></label>
          <label class="flex flex-col gap-1"><span class="text-[11.5px] text-muted font-600">Slug (URL)</span><input v-model="dest.slug" class="field !py-[9px] money" placeholder="bali"></label>
          <label class="flex flex-col gap-1"><span class="text-[11.5px] text-muted font-600">Region</span><input v-model="dest.region" class="field !py-[9px]" placeholder="Indonesia"></label>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AdminImageField label="Gambar hero (seni / ilustrasi)" hint="Tampil besar & menyatu dengan halaman panduan. Pakai ilustrasi/seni." :model-value="dest.heroImage || ''" @update:model-value="dest.heroImage = $event" />
          <AdminImageField label="Gambar kartu (foto)" hint="Tampil di kartu daftar Guides. Sebaiknya foto landscape." :model-value="dest.cardImage || ''" @update:model-value="dest.cardImage = $event" />
        </div>
        <label class="flex flex-col gap-1"><span class="text-[11.5px] text-muted font-600">Ringkasan</span><textarea v-model="dest.summary" rows="3" class="field !py-[9px] resize-none" placeholder="Sekilas tentang destinasi…" /></label>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label class="flex flex-col gap-1"><span class="text-[11.5px] text-muted font-600">Waktu terbaik</span><input v-model="dest.bestTime" class="field !py-[9px]" placeholder="Apr–Okt"></label>
          <label class="flex flex-col gap-1"><span class="text-[11.5px] text-muted font-600">Durasi ideal</span><input v-model="dest.idealDuration" class="field !py-[9px]" placeholder="5–7 hari"></label>
          <label class="flex flex-col gap-1 col-span-2"><span class="text-[11.5px] text-muted font-600">Cocok untuk (koma)</span><input v-model="goodForStr" class="field !py-[9px]" placeholder="Pasangan, Keluarga, Solo"></label>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label class="flex flex-col gap-1"><span class="text-[11.5px] text-muted font-600">Tipe perjalanan (koma)</span><input v-model="tripTypesStr" class="field !py-[9px]" placeholder="Pantai, Budaya, Kuliner"></label>
          <label class="flex flex-col gap-1"><span class="text-[11.5px] text-muted font-600">Alias untuk cocokkan trip (koma)</span><input v-model="aliasesStr" class="field !py-[9px]" placeholder="bali, ubud, kuta, seminyak"></label>
        </div>
        <label class="flex flex-col gap-1"><span class="text-[11.5px] text-muted font-600">Tips perjalanan (satu per baris)</span><textarea v-model="tipsStr" rows="3" class="field !py-[9px] resize-none" /></label>
        <label class="flex flex-col gap-1"><span class="text-[11.5px] text-muted font-600">Itinerary template — dipakai saat "Gunakan panduan untuk trip saya"</span><CoreSelect :model-value="dest.itineraryTemplateId || ''" :options="templateOptions" @update:model-value="dest.itineraryTemplateId = $event || undefined" /></label>
        <div class="flex flex-wrap items-center gap-5 pt-1">
          <label class="flex items-center gap-2 text-[13.5px] text-ink-2 cursor-pointer"><CoreCheckbox :model-value="!!dest.published" @update:model-value="dest.published = $event" /> Tayangkan (publik)</label>
          <label class="flex items-center gap-2 text-[13.5px] text-ink-2 cursor-pointer"><CoreCheckbox :model-value="!!dest.featured" @update:model-value="dest.featured = $event" /> Unggulan di beranda Guides</label>
          <label class="flex items-center gap-2 text-[13.5px] text-ink-2 cursor-pointer"><CoreCheckbox :model-value="!!dest.isPublic" @update:model-value="dest.isPublic = $event" /> Panduan publik (tanpa paket)</label>
        </div>
      </div>

      <!-- places -->
      <div class="flex items-center justify-between gap-3">
        <div class="font-display text-[20px] font-600">Tempat <span class="text-muted font-500">({{ places.length }})</span></div>
        <CoreButton variant="ghost" class="!px-[16px] !py-[10px] !text-[13.5px]" @click="openAddPlace">+ Tambah tempat</CoreButton>
      </div>
      <div v-if="places.length" class="flex flex-col gap-2">
        <AdminGuidePlace
          v-for="p in places"
          :key="p.id"
          :place="p"
          :start-open="p.id === newPlaceId"
          @save="onSavePlace"
          @remove="onRemovePlace(p)"
        />
      </div>
      <button v-else class="border border-dashed border-sand-line3 rounded-card min-h-[120px] flex flex-col items-center justify-center gap-2 text-muted hover:border-teal-600 hover:text-teal-700" @click="openAddPlace">
        <i class="i-lucide-plus text-[22px]" /> <span class="text-[13px] font-600">Tambah tempat pertama</span>
      </button>

      <!-- add place (popup) -->
      <CoreDialog v-model:open="placeModalOpen" side="center" :width="440" title="Tambah tempat">
        <div class="flex flex-col gap-3">
          <CoreInput v-model="draft.name" label="Nama tempat" placeholder="mis. Pantai Kelingking" @keydown.enter="createPlace" />
          <label class="flex flex-col gap-[7px]"><span class="text-[12.5px] font-600 text-ink-2">Jenis</span><CoreSelect v-model="draft.type" :options="typeOptions" /></label>
          <CoreInput v-model="draft.area" label="Area (opsional)" placeholder="mis. Ubud" @keydown.enter="createPlace" />
          <p class="text-[12px] text-muted">Harga, foto, dan deskripsi lengkap bisa diisi setelah tempat dibuat.</p>
        </div>
        <template #footer>
          <div class="flex justify-end gap-3">
            <CoreButton variant="ghost" class="!px-[16px] !py-[10px] !text-[13.5px]" @click="placeModalOpen = false">Batal</CoreButton>
            <CoreButton variant="primary" class="!px-[18px] !py-[10px] !text-[13.5px]" :disabled="!draft.name.trim()" @click="createPlace">Tambah tempat</CoreButton>
          </div>
        </template>
      </CoreDialog>
    </template>
  </div>
</template>
